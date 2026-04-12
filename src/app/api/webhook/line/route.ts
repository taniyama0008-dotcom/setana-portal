import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const CHANNEL_SECRET      = process.env.LINE_MESSAGING_CHANNEL_SECRET ?? ''
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? ''

// ─── LINE API helpers ────────────────────────────────────────

async function reply(replyToken: string, messages: object[]) {
  if (!CHANNEL_ACCESS_TOKEN) {
    console.error('[LINE Reply] CHANNEL_ACCESS_TOKEN is not set')
    return
  }
  const replyRes = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  })
  const replyBody = await replyRes.json()
  console.log('[LINE Reply] status:', replyRes.status, 'body:', JSON.stringify(replyBody))
}


// LINE Content API: 管理画面表示用（webhook処理では使わない）
// GET https://api-data.line.me/v2/bot/message/{messageId}/content
// Authorization: Bearer {CHANNEL_ACCESS_TOKEN}
// photo_url = "line://{messageId}" で保存し、表示時にこのURLから取得する

// ─── HMAC-SHA256 署名検証 ────────────────────────────────────

async function verifySignature(body: string, signature: string): Promise<boolean> {
  if (!CHANNEL_SECRET) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(CHANNEL_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac  = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const computed = Buffer.from(mac).toString('base64')
  return computed === signature
}

// ─── セッション管理 ──────────────────────────────────────────

type SessionState =
  | 'idle' | 'select_type'
  | 'infra_category' | 'shop_select' | 'shop_status'
  | 'weather_input' | 'other_input' | 'description_request'
  | 'photo_request' | 'photo_optional' | 'location_request' | 'confirm'

interface SessionContext {
  report_type?: 'infrastructure' | 'realtime_info'
  category?: string
  description?: string
  spot_id?: string | null
  spot_name?: string | null
  photo_url?: string | null
  latitude?: number | null
  longitude?: number | null
}

async function getSession(lineUserId: string): Promise<{ state: SessionState; context: SessionContext }> {
  const { data, error } = await supabaseAdmin
    .from('line_sessions')
    .select('state, context')
    .eq('line_user_id', lineUserId)
    .maybeSingle()
  if (error) console.error('[LINE Session] getSession error:', error.message, error.code)
  const state   = (data?.state as SessionState) ?? 'idle'
  const context = (data?.context as SessionContext) ?? {}
  console.log('[LINE Session] get:', lineUserId.slice(-6), '→ state:', state, 'context:', JSON.stringify(context))
  return { state, context }
}

async function setSession(lineUserId: string, state: SessionState, context: SessionContext) {
  console.log('[LINE Session] set:', lineUserId.slice(-6), '→ state:', state, 'context:', JSON.stringify(context))
  const { error } = await supabaseAdmin
    .from('line_sessions')
    .upsert(
      { line_user_id: lineUserId, state, context, updated_at: new Date().toISOString() },
      { onConflict: 'line_user_id' },
    )
  if (error) console.error('[LINE Session] setSession error:', error.message, error.code)
}

async function clearSession(lineUserId: string) {
  await setSession(lineUserId, 'idle', {})
}

// ─── LINE ユーザー取得 or 自動作成 ───────────────────────────

interface LineUserRecord {
  id: string
  coin_balance: number
  nickname: string | null
  line_display_name: string | null
}

async function getOrCreateLineUser(lineUserId: string): Promise<LineUserRecord | null> {
  // 既存ユーザーを検索
  const { data: existing, error: lookupErr } = await supabaseAdmin
    .from('users')
    .select('id, coin_balance, nickname, line_display_name')
    .eq('line_user_id', lineUserId)
    .maybeSingle()
  if (lookupErr) console.error('[LINE User] lookup error:', lookupErr.message, lookupErr.code)
  if (existing) {
    console.log('[LINE User] found existing user:', existing.id)
    return existing
  }

  // LINE Profile API でプロフィール取得
  let displayName = 'LINEユーザー'
  let pictureUrl: string | null = null
  if (CHANNEL_ACCESS_TOKEN) {
    const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${lineUserId}`, {
      headers: { Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}` },
    })
    if (profileRes.ok) {
      const profile = await profileRes.json() as { displayName?: string; pictureUrl?: string }
      displayName = profile.displayName ?? displayName
      pictureUrl  = profile.pictureUrl  ?? null
      console.log('[LINE User] fetched profile:', displayName)
    } else {
      console.warn('[LINE User] profile API status:', profileRes.status)
    }
  }

  // users テーブルに新規作成
  const { data: created, error: createErr } = await supabaseAdmin
    .from('users')
    .insert({
      line_user_id:      lineUserId,
      line_display_name: displayName,
      line_picture_url:  pictureUrl,
      role:              'user',
      coin_balance:      0,
    })
    .select('id, coin_balance, nickname, line_display_name')
    .single()

  if (createErr) {
    console.error('[LINE User] create error:', createErr.message, createErr.code, createErr.details)
    return null
  }
  console.log('[LINE User] created new user:', created.id, displayName)
  return created
}

// ─── コイン付与 ──────────────────────────────────────────────

async function awardCoins(
  user: LineUserRecord,
  amount: number,
  reason: string,
  referenceId: string,
): Promise<number> {
  const newBalance = (user.coin_balance ?? 0) + amount
  console.log('[LINE Coins] awarding', amount, 'coins to user', user.id, '| reason:', reason, '| new balance:', newBalance)

  const [{ error: txErr }, { error: balanceErr }] = await Promise.all([
    supabaseAdmin.from('coin_transactions').insert({
      user_id:      user.id,
      amount,
      reason,
      reference_id: referenceId,
    }),
    supabaseAdmin.from('users').update({ coin_balance: newBalance }).eq('id', user.id),
  ])
  if (txErr)      console.error('[LINE Coins] coin_transactions insert error:', txErr.message, txErr.code, txErr.details)
  if (balanceErr) console.error('[LINE Coins] coin_balance update error:', balanceErr.message, balanceErr.code)
  return newBalance
}

// ─── レポート保存 ────────────────────────────────────────────

function fallbackReportNumber(): string {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.floor(Math.random() * 900 + 100)
  return `R-${ymd}-${rand}`
}

async function saveReport(lineUserId: string, ctx: SessionContext): Promise<{ reportNumber: string; coins: number }> {
  const reportType = ctx.report_type ?? 'realtime_info'

  // ユーザー取得 or 自動作成（サイトLINEログイン未登録でもコイン付与可能に）
  const user = await getOrCreateLineUser(lineUserId)
  console.log('[LINE Report] inserting report | type:', reportType, 'category:', ctx.category ?? 'other', 'user:', user?.id ?? 'anonymous')

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('reports')
    .insert({
      user_id:       user?.id ?? null,
      line_user_id:  lineUserId,
      reporter_name: user ? (user.nickname ?? user.line_display_name) : null,
      category:      ctx.category ?? 'other',
      report_type:   reportType,
      description:   ctx.description ?? null,
      spot_id:       ctx.spot_id ?? null,
      spot_name:     ctx.spot_name ?? null,
      photo_url:     ctx.photo_url ?? null,
      latitude:      ctx.latitude ?? null,
      longitude:     ctx.longitude ?? null,
      status:        'received',
    })
    .select('id, report_number')
    .single()

  if (insertErr) console.error('[LINE Report] insert error:', insertErr.message, insertErr.code, insertErr.details)
  if (!inserted) {
    console.error('[LINE Report] inserted is null — returning fallback')
    return { reportNumber: fallbackReportNumber(), coins: 0 }
  }

  // トリガーが空文字を返した場合のフォールバック
  const reportNumber = inserted.report_number || fallbackReportNumber()
  console.log('[LINE Report] saved | id:', inserted.id, 'report_number:', reportNumber)

  // コイン付与（ユーザーが取得 or 作成できた場合のみ）
  let coinAmount = reportType === 'infrastructure' ? 10 : 3
  if (ctx.photo_url) coinAmount += 2
  const reason = reportType === 'infrastructure' ? 'report_infra' : 'report_info'

  if (user) {
    await awardCoins(user, coinAmount, reason, inserted.id)
    await supabaseAdmin.from('reports').update({ coins_awarded: coinAmount }).eq('id', inserted.id)
  } else {
    console.warn('[LINE Report] user is null — skipping coin award')
    coinAmount = 0
  }

  // インフラ通報は担当部署へメール転送（環境変数があれば）
  if (reportType === 'infrastructure') {
    await forwardByEmail(inserted.id, ctx)
  }

  return { reportNumber: reportNumber, coins: coinAmount }
}

// ─── メール転送（Phase1: 環境変数なければスキップ） ──────────

async function forwardByEmail(reportId: string, ctx: SessionContext) {
  const emailMap: Record<string, string | undefined> = {
    road:        process.env.FORWARD_EMAIL_ROAD,
    snow:        process.env.FORWARD_EMAIL_ROAD,
    streetlight: process.env.FORWARD_EMAIL_LIGHT,
    park:        process.env.FORWARD_EMAIL_PARK,
    other:       process.env.FORWARD_EMAIL_OTHER,
  }
  const to = emailMap[ctx.category ?? 'other']
  if (!to || !process.env.RESEND_API_KEY) return

  const mapsLink = ctx.latitude && ctx.longitude
    ? `https://www.google.com/maps?q=${ctx.latitude},${ctx.longitude}`
    : '（位置情報なし）'

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@setana.life',
      to:   [to],
      subject: `[通報] ${ctx.category} - ${reportId.slice(0, 8)}`,
      html: `<p>カテゴリ: ${ctx.category}</p>
             <p>内容: ${ctx.description ?? '—'}</p>
             <p>場所: ${ctx.spot_name ?? '—'}</p>
             ${ctx.photo_url ? `<p>写真: <a href="${ctx.photo_url}">${ctx.photo_url}</a></p>` : ''}
             <p>マップ: <a href="${mapsLink}">${mapsLink}</a></p>`,
    }),
  })

  await supabaseAdmin.from('reports').update({
    forwarded_to: to,
    forwarded_at: new Date().toISOString(),
  }).eq('id', reportId)
}


// ─── クイックリプライ構築ユーティリティ ──────────────────────

type QRAction =
  | { type: 'postback'; label: string; data: string; displayText?: string }
  | { type: 'message';  label: string; text: string }

function qrText(text: string, items: QRAction[]) {
  return {
    type: 'text',
    text,
    quickReply: {
      items: items.map((a) => ({ type: 'action', action: a })),
    },
  }
}

function pb(label: string, data: string, displayText?: string): QRAction {
  return { type: 'postback', label, data, displayText: displayText ?? label }
}

// ─── 確認 Flex Message ───────────────────────────────────────

const categoryLabels: Record<string, string> = {
  road: '道路（陥没・落石）', streetlight: '街灯の故障', park: '公園・遊具',
  snow: '除雪', other: 'その他',
  shop_closed: '臨時休業', shop_hours: '営業時間変更', shop_crowded: '混雑',
  weather: '道路・天候', event_info: 'イベント情報', other_info: 'その他情報',
}

function buildConfirmFlex(ctx: SessionContext) {
  const catLabel  = categoryLabels[ctx.category ?? 'other'] ?? ctx.category
  const typeLabel = ctx.report_type === 'infrastructure' ? 'こまった 🚧' : 'お店のいま 🏪'
  const place     = ctx.spot_name ?? (ctx.latitude ? `${ctx.latitude.toFixed(4)}, ${ctx.longitude?.toFixed(4)}` : '（場所なし）')

  return {
    type: 'flex',
    altText: 'おしえてくれた内容の確認',
    contents: {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#5b7e95',
        contents: [{ type: 'text', text: '📋 おしえてくれた内容', color: '#ffffff', weight: 'bold', size: 'md' }],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [
          { type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: '種別', size: 'sm', color: '#8a8a8a', flex: 2 },
            { type: 'text', text: typeLabel, size: 'sm', flex: 5, wrap: true },
          ]},
          { type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: 'カテゴリ', size: 'sm', color: '#8a8a8a', flex: 2 },
            { type: 'text', text: catLabel, size: 'sm', flex: 5, wrap: true },
          ]},
          { type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: '場所', size: 'sm', color: '#8a8a8a', flex: 2 },
            { type: 'text', text: place, size: 'sm', flex: 5, wrap: true },
          ]},
          { type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: '内容', size: 'sm', color: '#8a8a8a', flex: 2 },
            { type: 'text', text: ctx.description ?? '（なし）', size: 'sm', flex: 5, wrap: true },
          ]},
          { type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: '写真', size: 'sm', color: '#8a8a8a', flex: 2 },
            { type: 'text', text: ctx.photo_url ? 'あり ✓' : 'なし', size: 'sm', flex: 5 },
          ]},
        ],
      },
      footer: {
        type: 'box', layout: 'horizontal', spacing: 'sm',
        contents: [
          { type: 'button', style: 'primary', color: '#5b7e95', height: 'sm',
            action: { type: 'postback', label: '送信する', data: 'confirm_submit', displayText: '送信する' } },
          { type: 'button', style: 'secondary', height: 'sm',
            action: { type: 'postback', label: 'やり直す', data: 'confirm_cancel', displayText: 'やり直す' } },
        ],
      },
    },
  }
}

// ─── イベント処理 ────────────────────────────────────────────

async function handleEvent(event: Record<string, unknown>) {
  const source     = event.source as Record<string, string>
  const lineUserId = source?.userId
  if (!lineUserId) return

  const replyToken = event.replyToken as string
  const msg = event.message as Record<string, unknown> | undefined
  console.log('[LINE Event] type:', event.type, 'userId:', lineUserId.slice(-6),
    msg ? `msgType:${msg.type} text:${msg.text ?? ''}` : '',
    event.type === 'postback' ? `data:${(event.postback as Record<string,string>)?.data}` : '')

  const { state, context } = await getSession(lineUserId)
  console.log('[LINE Bot] current state:', state, '| event:', event.type)

  if (event.type === 'follow') {
    await clearSession(lineUserId)
    await reply(replyToken, [
      { type: 'text', text: 'せたなポータルへようこそ！🌊\n道路の不具合・お店の臨時休業など、地域の"いま"をみんなでシェアしよう。\n\n「おしえる」と送ってみてください 😊' },
    ])
    return
  }

  if (event.type === 'postback') {
    const data = (event.postback as Record<string, string>)?.data ?? ''
    await handlePostback(lineUserId, replyToken, state, context, data)
    return
  }

  if (event.type === 'message') {
    const msg = event.message as Record<string, string>
    if (msg.type === 'image') {
      await handleImage(lineUserId, replyToken, state, context, msg.id)
    } else if (msg.type === 'location') {
      await handleLocation(lineUserId, replyToken, state, context, event.message as Record<string, unknown>)
    } else if (msg.type === 'text') {
      await handleText(lineUserId, replyToken, state, context, msg.text)
    } else {
      // スタンプ・音声など非対応メッセージ → stateに関わらずリセット
      console.log('[LINE Bot] unsupported message type:', msg.type, '| state:', state)
      await resetWithGuide(lineUserId, replyToken, `unsupported msg type:${msg.type}`)
    }
  }
}

// ─── リセットキーワード判定 ─────────────────────────────────

const RESET_PATTERN = /おしえる|教える|おしえて|通報|報告|つうほう|ほうこく|リセット|やり直|最初から|はじめから/

async function resetAndStart(lineUserId: string, replyToken: string) {
  console.log('[LINE Bot] RESET triggered — clearing session and starting report flow')
  await clearSession(lineUserId)
  await handleStartReport(lineUserId, replyToken)
}

async function resetWithGuide(lineUserId: string, replyToken: string, reason: string) {
  console.log('[LINE Bot] unexpected input (', reason, ') — resetting session to idle')
  await clearSession(lineUserId)
  await reply(replyToken, [
    qrText('リセットしました。「おしえる」と送ってね 😊',
      [pb('おしえる 📢', 'report_start', 'おしえる')]),
  ])
}

// ─── テキストメッセージ処理 ──────────────────────────────────

async function handleText(
  lineUserId: string, replyToken: string,
  state: SessionState, context: SessionContext, text: string,
) {
  const t = text.trim()
  console.log('[LINE Bot] handleText | state:', state, 'text:', t)

  // リセットキーワードは state に関わらず最優先でリセット
  if (RESET_PATTERN.test(t)) {
    await resetAndStart(lineUserId, replyToken)
    return
  }

  if (state === 'idle') {
    if (/コイン|残高/.test(t)) {
      console.log('[LINE Bot] handling: coin_balance')
      await handleCoinBalance(lineUserId, replyToken)
    } else {
      console.log('[LINE Bot] idle: unrecognized text, sending prompt')
      await reply(replyToken, [
        qrText('「おしえる」と送ると始められるよ 😊',
          [pb('おしえる 📢', 'report_start', 'おしえる')]),
      ])
    }
    return
  }

  if (state === 'shop_select') {
    console.log('[LINE Bot] transitioning to: shop_search with query:', t)
    await handleShopSearch(lineUserId, replyToken, context, t)
    return
  }

  if (state === 'description_request' || state === 'weather_input' || state === 'other_input') {
    console.log('[LINE Bot] transitioning to: photo_optional | description:', t)
    const newCtx = { ...context, description: t }
    await setSession(lineUserId, 'photo_optional', newCtx)
    await reply(replyToken, [
      qrText('写真があれば送ってね。なければ「なし」で OK 👌',
        [pb('なし（写真なし）', 'skip_photo', 'なし（写真なし）')]),
    ])
    return
  }

  if (state === 'photo_request') {
    if (/なし|skip|スキップ/i.test(t)) {
      console.log('[LINE Bot] transitioning to: location_request (photo skipped via text)')
      await setSession(lineUserId, 'location_request', context)
      await reply(replyToken, [
        qrText('場所を送ってね。わからなければ「なし」で OK 📍',
          [pb('なし（場所なし）', 'skip_location', 'なし（場所なし）')]),
      ])
    } else {
      // photo_request で想定外テキスト → 再案内（リセットはしない）
      console.log('[LINE Bot] photo_request: non-skip text received, re-prompting')
      await reply(replyToken, [
        qrText('写真があれば送ってね。なければ「なし」で OK 👌',
          [pb('なし（写真なし）', 'skip_photo', 'なし（写真なし）')]),
      ])
    }
    return
  }

  if (state === 'photo_optional') {
    if (/なし|skip|スキップ/i.test(t)) {
      console.log('[LINE Bot] transitioning to: confirm (photo skipped, photo_optional)')
      const newCtx = { ...context, photo_url: null }
      await setSession(lineUserId, 'confirm', newCtx)
      await reply(replyToken, [buildConfirmFlex(newCtx)])
    } else {
      // photo_optional で想定外テキスト → 再案内（リセットはしない）
      console.log('[LINE Bot] photo_optional: non-skip text received, re-prompting')
      await reply(replyToken, [
        qrText('写真があれば送ってね。なければ「なし」で OK 👌',
          [pb('なし（写真なし）', 'skip_photo', 'なし（写真なし）')]),
      ])
    }
    return
  }

  if (state === 'location_request') {
    if (/なし|skip|スキップ/i.test(t)) {
      console.log('[LINE Bot] transitioning to: confirm (location skipped via text)')
      await setSession(lineUserId, 'confirm', context)
      await reply(replyToken, [buildConfirmFlex(context)])
    } else {
      // location_request で想定外テキスト → 再案内（リセットはしない）
      console.log('[LINE Bot] location_request: non-skip text received, re-prompting')
      await reply(replyToken, [
        qrText('場所を送ってね。わからなければ「なし」で OK 📍',
          [pb('なし（場所なし）', 'skip_location', 'なし（場所なし）')]),
      ])
    }
    return
  }

  // select_type / infra_category / shop_status / confirm など、
  // テキスト入力が想定されない state → リセットして案内
  await resetWithGuide(lineUserId, replyToken, `unexpected text in state:${state}`)
}

// ─── ポストバック処理 ────────────────────────────────────────

async function handlePostback(
  lineUserId: string, replyToken: string,
  state: SessionState, context: SessionContext, data: string,
) {
  console.log('[LINE Bot] handlePostback | state:', state, 'data:', data)

  if (data === 'report_start' || data === 'coin_balance') {
    if (data === 'coin_balance') {
      console.log('[LINE Bot] handling: coin_balance')
      await handleCoinBalance(lineUserId, replyToken)
      return
    }
    console.log('[LINE Bot] transitioning to: select_type (via handleStartReport)')
    await handleStartReport(lineUserId, replyToken)
    return
  }

  if (data === 'confirm_submit') {
    console.log('[LINE Bot] confirm_submit: saving report, context:', JSON.stringify(context))
    const { reportNumber, coins } = await saveReport(lineUserId, context)
    console.log('[LINE Bot] report saved | reportNumber:', reportNumber, 'coins:', coins)
    await clearSession(lineUserId)
    console.log('[LINE Bot] transitioning to: idle (after submit)')
    const typeLabel = context.report_type === 'infrastructure'
      ? '情報ありがとうございます！担当部署におしらせしました 🙏'
      : 'ありがとう！確認できたら「今のせたな」に載せますね 📢'
    const { data: user } = await supabaseAdmin.from('users').select('coin_balance').eq('line_user_id', lineUserId).maybeSingle()
    const balanceText = user ? `いまの残高: ${user.coin_balance ?? 0}コイン` : ''
    await reply(replyToken, [{
      type: 'text',
      text: `✅ ${typeLabel}\n受付番号: ${reportNumber}\n${coins}コイン ゲット！💰\n${balanceText}`,
    }])
    return
  }

  if (data === 'confirm_cancel') {
    console.log('[LINE Bot] transitioning to: idle (confirm cancelled)')
    await clearSession(lineUserId)
    await reply(replyToken, [{ type: 'text', text: 'キャンセルしました。また「おしえる」と送ってね 😊' }])
    return
  }

  if (data === 'skip_photo') {
    if (state === 'photo_request') {
      console.log('[LINE Bot] transitioning to: location_request (photo skipped via postback)')
      await setSession(lineUserId, 'location_request', context)
      await reply(replyToken, [
        qrText('場所を送ってね。わからなければ「なし」で OK 📍',
          [pb('なし（場所なし）', 'skip_location', 'なし（場所なし）')]),
      ])
    } else {
      console.log('[LINE Bot] transitioning to: confirm (photo skipped, state:', state, ')')
      const newCtx = { ...context, photo_url: null }
      await setSession(lineUserId, 'confirm', newCtx)
      await reply(replyToken, [buildConfirmFlex(newCtx)])
    }
    return
  }

  if (data === 'skip_location') {
    console.log('[LINE Bot] transitioning to: confirm (location skipped via postback)')
    await setSession(lineUserId, 'confirm', context)
    await reply(replyToken, [buildConfirmFlex(context)])
    return
  }

  // ─ select_type ─
  if (state === 'select_type') {
    if (data === 'type_infra') {
      console.log('[LINE Bot] transitioning to: infra_category')
      await setSession(lineUserId, 'infra_category', { report_type: 'infrastructure' })
      await reply(replyToken, [
        qrText('どんなことで困っていますか？',
          [pb('道路（陥没・落石）', 'cat_road'), pb('街灯の故障', 'cat_streetlight'),
           pb('公園・遊具', 'cat_park'), pb('除雪', 'cat_snow'), pb('その他', 'cat_other')]),
      ])
    } else if (data === 'type_shop') {
      console.log('[LINE Bot] transitioning to: shop_select')
      await setSession(lineUserId, 'shop_select', { report_type: 'realtime_info' })
      await reply(replyToken, [{ type: 'text', text: 'どのお店ですか？（名前を入力してね）' }])
    } else if (data === 'type_weather') {
      console.log('[LINE Bot] transitioning to: weather_input')
      await setSession(lineUserId, 'weather_input', { report_type: 'realtime_info', category: 'weather' })
      await reply(replyToken, [{ type: 'text', text: '道路・天候の状況をおしえてください 🌤️' }])
    } else if (data === 'type_other') {
      console.log('[LINE Bot] transitioning to: other_input')
      await setSession(lineUserId, 'other_input', { report_type: 'realtime_info', category: 'other_info' })
      await reply(replyToken, [{ type: 'text', text: 'どんな情報ですか？おしえてください 📝' }])
    } else {
      console.log('[LINE Bot] select_type: unrecognized data:', data)
    }
    return
  }

  // ─ infra_category ─
  if (state === 'infra_category') {
    console.log('[LINE Bot] infra_category: received data:', data)
    const catMap: Record<string, string> = {
      cat_road: 'road', cat_streetlight: 'streetlight', cat_park: 'park', cat_snow: 'snow', cat_other: 'other',
    }
    const category = catMap[data]
    if (category) {
      console.log('[LINE Bot] transitioning to: photo_request | category:', category)
      const newCtx = { ...context, category }
      await setSession(lineUserId, 'photo_request', newCtx)
      await reply(replyToken, [
        qrText('写真があれば送ってね。なければ「なし」で OK 👌',
          [pb('なし（写真なし）', 'skip_photo', 'なし（写真なし）')]),
      ])
    } else {
      console.log('[LINE Bot] infra_category: unknown data, no catMap match for:', data)
    }
    return
  }

  // ─ shop_status ─
  if (state === 'shop_status') {
    console.log('[LINE Bot] shop_status: received data:', data)

    if (data === 'shop_closed') {
      // 臨時休業: description 自動セット → 確認画面へ直行
      const newCtx = { ...context, category: 'shop_closed', description: '臨時休業', photo_url: null }
      console.log('[LINE Bot] transitioning to: confirm (shop_closed, auto description)')
      await setSession(lineUserId, 'confirm', newCtx)
      await reply(replyToken, [buildConfirmFlex(newCtx)])

    } else if (data === 'shop_crowded') {
      // 混雑: description 自動セット → 確認画面へ直行
      const newCtx = { ...context, category: 'shop_crowded', description: '混雑中', photo_url: null }
      console.log('[LINE Bot] transitioning to: confirm (shop_crowded, auto description)')
      await setSession(lineUserId, 'confirm', newCtx)
      await reply(replyToken, [buildConfirmFlex(newCtx)])

    } else if (data === 'shop_hours') {
      // 営業時間変更: 変更後の時間を聞く → confirm
      const newCtx = { ...context, category: 'shop_hours' }
      console.log('[LINE Bot] transitioning to: description_request (shop_hours)')
      await setSession(lineUserId, 'description_request', newCtx)
      await reply(replyToken, [{ type: 'text', text: '変更後の営業時間をおしえてください。（例: 10:00〜17:00）' }])

    } else if (data === 'shop_other') {
      // その他: 詳細を聞く → description_request → photo_optional → confirm
      const newCtx = { ...context, category: 'other_info' }
      console.log('[LINE Bot] transitioning to: description_request (shop_other)')
      await setSession(lineUserId, 'description_request', newCtx)
      await reply(replyToken, [{ type: 'text', text: 'どんな状況ですか？' }])

    } else {
      console.log('[LINE Bot] shop_status: unknown data:', data)
    }
    return
  }

  // ─ shop_select の確認 ─
  if (state === 'shop_select') {
    if (data.startsWith('shop_confirm:')) {
      const spotId = data.split(':')[1]
      const spotName = data.split(':')[2] ?? ''
      console.log('[LINE Bot] transitioning to: shop_status | spot:', spotId, spotName)
      const newCtx = { ...context, spot_id: spotId, spot_name: spotName }
      await setSession(lineUserId, 'shop_status', newCtx)
      await reply(replyToken, [
        qrText('どんな情報ですか？',
          [pb('臨時休業', 'shop_closed'), pb('営業時間変更', 'shop_hours'),
           pb('混雑している', 'shop_crowded'), pb('その他', 'shop_other')]),
      ])
    } else if (data === 'shop_other_name') {
      console.log('[LINE Bot] shop_select: re-prompting shop name entry')
      // すでにshop_selectに戻る → テキスト待ち
      await reply(replyToken, [{ type: 'text', text: 'もう一度お店の名前を入力してください。' }])
    } else {
      console.log('[LINE Bot] shop_select: unrecognized data:', data)
    }
    return
  }

  // 想定外の state/data → リセットして案内
  await resetWithGuide(lineUserId, replyToken, `unhandled postback state:${state} data:${data}`)
}

// ─── 画像メッセージ処理 ──────────────────────────────────────
// 外部APIコールなし: messageId を "line://{id}" として context に保存するのみ
// 実際の画像取得は管理画面表示時または非同期バッチで行う

async function handleImage(
  lineUserId: string, replyToken: string,
  state: SessionState, context: SessionContext, messageId: string,
) {
  if (state === 'photo_request' || state === 'photo_optional') {
    console.log('[LINE Bot] handleImage | state:', state, 'messageId:', messageId)
    // アップロードせず messageId を参照IDとして保存
    const newCtx = { ...context, photo_url: `line://${messageId}` }

    if (state === 'photo_request') {
      await setSession(lineUserId, 'location_request', newCtx)
      console.log('[LINE Bot] transitioning to: location_request (photo ref saved)')
      await reply(replyToken, [
        qrText('📷 写真を受け取りました！\n現在地を送ってください（任意）。',
          [pb('なし（場所なし）', 'skip_location', 'なし（場所なし）')]),
      ])
    } else {
      // photo_optional
      await setSession(lineUserId, 'confirm', newCtx)
      console.log('[LINE Bot] transitioning to: confirm (photo ref saved, photo_optional)')
      await reply(replyToken, [buildConfirmFlex(newCtx)])
    }
  } else if (state === 'idle') {
    await reply(replyToken, [
      qrText('写真を受け取りました 📷 おしえることがあれば送ってね！',
        [pb('おしえる 📢', 'report_start', 'おしえる')]),
    ])
  } else {
    // 想定外の state で画像 → リセットして案内
    await resetWithGuide(lineUserId, replyToken, `unexpected image in state:${state}`)
  }
}

// ─── 位置情報処理 ─────────────────────────────────────────────

async function handleLocation(
  lineUserId: string, replyToken: string,
  state: SessionState, context: SessionContext, message: Record<string, unknown>,
) {
  if (state === 'location_request') {
    const lat = message.latitude as number
    const lng = message.longitude as number
    const newCtx = { ...context, latitude: lat, longitude: lng }
    await setSession(lineUserId, 'confirm', newCtx)
    await reply(replyToken, [buildConfirmFlex(newCtx)])
  } else {
    // 想定外の state で位置情報 → リセットして案内
    await resetWithGuide(lineUserId, replyToken, `unexpected location in state:${state}`)
  }
}

// ─── お店あいまい検索 ─────────────────────────────────────────

async function handleShopSearch(
  lineUserId: string, replyToken: string,
  context: SessionContext, shopName: string,
) {
  const { data: spots } = await supabaseAdmin
    .from('spots')
    .select('id, name')
    .eq('status', 'public')
    .ilike('name', `%${shopName}%`)
    .limit(3)

  if (spots && spots.length > 0) {
    const items: QRAction[] = spots.map((s) => ({
      type: 'postback',
      label: s.name.slice(0, 20),
      data: `shop_confirm:${s.id}:${s.name}`,
      displayText: s.name.slice(0, 20),
    }))
    items.push(pb('違う店を入力', 'shop_other_name', '違う店を入力'))
    await reply(replyToken, [
      qrText(`「${spots[0].name}」ですか？`, items),
    ])
    // セッションは shop_select のまま
  } else {
    // 見つからなければそのまま店名として保存
    const newCtx = { ...context, spot_name: shopName }
    await setSession(lineUserId, 'shop_status', newCtx)
    await reply(replyToken, [
      qrText('どんな情報ですか？🏪',
        [pb('臨時休業', 'shop_closed'), pb('営業時間変更', 'shop_hours'),
         pb('混雑している', 'shop_crowded'), pb('その他', 'shop_other')]),
    ])
  }
}

// ─── 通報開始 ────────────────────────────────────────────────

async function handleStartReport(lineUserId: string, replyToken: string) {
  await setSession(lineUserId, 'select_type', {})
  await reply(replyToken, [
    qrText('せたなの"いま"をおしえてください 🙌',
      [pb('こまった 🚧', 'type_infra'), pb('お店のいま 🏪', 'type_shop'),
       pb('道路・天候 🌤️', 'type_weather'), pb('その他', 'type_other')]),
  ])
}

// ─── コイン残高確認 ──────────────────────────────────────────

async function handleCoinBalance(lineUserId: string, replyToken: string) {
  const user = await getOrCreateLineUser(lineUserId)
  const balance = user?.coin_balance ?? 0
  await reply(replyToken, [{
    type: 'text',
    text: `🪙 せたなコイン残高: ${balance}コイン\n\nコインは通報・情報提供で貯まります！\nhttps://www.setana.life/mypage`,
  }])
}

// ─── POST エントリーポイント ─────────────────────────────────

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-line-signature') ?? ''
  const body = await req.text()

  const valid = await verifySignature(body, signature)
  if (!valid && CHANNEL_SECRET) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let parsed: { events?: Record<string, unknown>[] }
  try { parsed = JSON.parse(body) } catch { return NextResponse.json({ ok: true }) }

  const events = parsed.events ?? []
  await Promise.all(events.map((e) => handleEvent(e).catch(console.error)))

  return NextResponse.json({ ok: true })
}
