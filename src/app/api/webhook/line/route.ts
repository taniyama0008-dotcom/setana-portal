import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const CHANNEL_SECRET      = process.env.LINE_MESSAGING_CHANNEL_SECRET ?? ''
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? ''
const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

// ─── LINE API helpers ────────────────────────────────────────

async function reply(replyToken: string, messages: object[]) {
  if (!CHANNEL_ACCESS_TOKEN) return
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  })
}

async function downloadContent(messageId: string): Promise<ArrayBuffer | null> {
  if (!CHANNEL_ACCESS_TOKEN) return null
  const res = await fetch(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    { headers: { Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}` } },
  )
  if (!res.ok) return null
  return res.arrayBuffer()
}

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
  const { data } = await supabaseAdmin
    .from('line_sessions')
    .select('state, context')
    .eq('line_user_id', lineUserId)
    .maybeSingle()
  return { state: (data?.state as SessionState) ?? 'idle', context: (data?.context as SessionContext) ?? {} }
}

async function setSession(lineUserId: string, state: SessionState, context: SessionContext) {
  await supabaseAdmin
    .from('line_sessions')
    .upsert({ line_user_id: lineUserId, state, context, updated_at: new Date().toISOString() })
}

async function clearSession(lineUserId: string) {
  await setSession(lineUserId, 'idle', {})
}

// ─── コイン付与 ──────────────────────────────────────────────

async function awardCoins(
  lineUserId: string,
  amount: number,
  reason: string,
  referenceId: string,
): Promise<number> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, coin_balance')
    .eq('line_user_id', lineUserId)
    .maybeSingle()
  if (!user) return 0

  const newBalance = (user.coin_balance ?? 0) + amount
  await Promise.all([
    supabaseAdmin.from('coin_transactions').insert({
      user_id: user.id,
      amount,
      reason,
      reference_id: referenceId,
    }),
    supabaseAdmin.from('users').update({ coin_balance: newBalance }).eq('id', user.id),
  ])
  return newBalance
}

// ─── レポート保存 ────────────────────────────────────────────

async function saveReport(lineUserId: string, ctx: SessionContext): Promise<{ reportNumber: string; coins: number }> {
  const reportType = ctx.report_type ?? 'realtime_info'

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, nickname, line_display_name')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

  const { data: inserted } = await supabaseAdmin
    .from('reports')
    .insert({
      user_id:      user?.id ?? null,
      line_user_id: lineUserId,
      reporter_name: user ? (user.nickname ?? user.line_display_name) : null,
      category:     ctx.category ?? 'other',
      report_type:  reportType,
      description:  ctx.description ?? null,
      spot_id:      ctx.spot_id ?? null,
      spot_name:    ctx.spot_name ?? null,
      photo_url:    ctx.photo_url ?? null,
      latitude:     ctx.latitude ?? null,
      longitude:    ctx.longitude ?? null,
      status:       'received',
    })
    .select('id, report_number')
    .single()

  if (!inserted) return { reportNumber: '—', coins: 0 }

  // コイン付与
  let coinAmount = reportType === 'infrastructure' ? 10 : 3
  if (ctx.photo_url) coinAmount += 2

  const reason  = reportType === 'infrastructure' ? 'report_infra' : 'report_info'
  let newBalance = 0
  if (user) {
    newBalance = await awardCoins(lineUserId, coinAmount, reason, inserted.id)
    // 写真ボーナス別途記録は上の合算でOK（specに合わせてphoto_bonusは独立しても可）
    await supabaseAdmin.from('reports').update({ coins_awarded: coinAmount }).eq('id', inserted.id)
  }

  // インフラ通報は担当部署へメール転送（環境変数があれば）
  if (reportType === 'infrastructure') {
    await forwardByEmail(inserted.id, ctx)
  }

  return { reportNumber: inserted.report_number, coins: coinAmount }
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

// ─── 写真アップロード ─────────────────────────────────────────

async function uploadPhoto(messageId: string, lineUserId: string): Promise<string | null> {
  const buf = await downloadContent(messageId)
  if (!buf) return null

  const path = `${lineUserId}/${Date.now()}.jpg`
  const { error } = await supabaseAdmin.storage
    .from('reports')
    .upload(path, buf, { contentType: 'image/jpeg', upsert: true })

  if (error) { console.error('[webhook] upload error', error); return null }
  return `${SUPABASE_URL}/storage/v1/object/public/reports/${path}`
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
  const typeLabel = ctx.report_type === 'infrastructure' ? 'インフラ通報' : 'リアルタイム情報'
  const place     = ctx.spot_name ?? (ctx.latitude ? `${ctx.latitude.toFixed(4)}, ${ctx.longitude?.toFixed(4)}` : '（場所なし）')

  return {
    type: 'flex',
    altText: '通報内容の確認',
    contents: {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#5b7e95',
        contents: [{ type: 'text', text: '📋 通報内容の確認', color: '#ffffff', weight: 'bold', size: 'md' }],
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
  const { state, context } = await getSession(lineUserId)

  if (event.type === 'follow') {
    await clearSession(lineUserId)
    await reply(replyToken, [
      { type: 'text', text: 'せたなポータルへようこそ！\n道路の不具合・お店の臨時休業など、地域の情報をLINEで簡単に送れます。\n\n「通報」または「報告」と送ってみてください。' },
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
      await reply(replyToken, [{ type: 'text', text: 'テキストまたは写真で送ってください。' }])
    }
  }
}

// ─── テキストメッセージ処理 ──────────────────────────────────

async function handleText(
  lineUserId: string, replyToken: string,
  state: SessionState, context: SessionContext, text: string,
) {
  const t = text.trim()

  if (state === 'idle') {
    if (/通報|報告|つうほう|ほうこく/.test(t)) {
      await handleStartReport(lineUserId, replyToken)
    } else if (/コイン|残高/.test(t)) {
      await handleCoinBalance(lineUserId, replyToken)
    } else {
      await reply(replyToken, [
        qrText('「通報」または「報告」と送ると情報を受け付けます。',
          [pb('通報・情報を送る', 'report_start', '通報')]),
      ])
    }
    return
  }

  if (state === 'shop_select') {
    await handleShopSearch(lineUserId, replyToken, context, t)
    return
  }

  if (state === 'description_request' || state === 'weather_input' || state === 'other_input') {
    const newCtx = { ...context, description: t }
    await setSession(lineUserId, 'photo_optional', newCtx)
    await reply(replyToken, [
      qrText('写真があれば送ってください。なければ「なし」と入力してください。',
        [pb('なし', 'skip_photo', 'なし（写真なし）')]),
    ])
    return
  }

  if (state === 'photo_request') {
    if (/なし|skip|スキップ/i.test(t)) {
      await setSession(lineUserId, 'location_request', context)
      await reply(replyToken, [
        qrText('現在地を送ってください。位置情報ボタンを押すか、「なし」と入力してください。',
          [pb('なし（場所なし）', 'skip_location', 'なし（場所なし）')]),
      ])
    } else {
      await reply(replyToken, [{ type: 'text', text: '写真を送ってください。スキップする場合は「なし」と入力してください。' }])
    }
    return
  }

  if (state === 'photo_optional') {
    if (/なし|skip|スキップ/i.test(t)) {
      const newCtx = { ...context, photo_url: null }
      await setSession(lineUserId, 'confirm', newCtx)
      await reply(replyToken, [buildConfirmFlex(newCtx)])
    } else {
      await reply(replyToken, [{ type: 'text', text: '写真を送るか「なし」と入力してください。' }])
    }
    return
  }

  if (state === 'location_request') {
    if (/なし|skip|スキップ/i.test(t)) {
      await setSession(lineUserId, 'confirm', context)
      await reply(replyToken, [buildConfirmFlex(context)])
    } else {
      await reply(replyToken, [{ type: 'text', text: '位置情報ボタンで場所を送るか「なし」と入力してください。' }])
    }
    return
  }

  // 他の state でのテキストは汎用メッセージ
  await reply(replyToken, [{ type: 'text', text: 'ボタンから選んでください。最初からやり直す場合は「通報」と送ってください。' }])
}

// ─── ポストバック処理 ────────────────────────────────────────

async function handlePostback(
  lineUserId: string, replyToken: string,
  state: SessionState, context: SessionContext, data: string,
) {
  if (data === 'report_start' || data === 'coin_balance') {
    if (data === 'coin_balance') { await handleCoinBalance(lineUserId, replyToken); return }
    await handleStartReport(lineUserId, replyToken)
    return
  }

  if (data === 'confirm_submit') {
    const { reportNumber, coins } = await saveReport(lineUserId, context)
    await clearSession(lineUserId)
    const typeLabel = context.report_type === 'infrastructure'
      ? '通報を受け付けました。担当部署に転送済みです。'
      : '情報をありがとうございます！確認後に公開されます。'
    const { data: user } = await supabaseAdmin.from('users').select('coin_balance').eq('line_user_id', lineUserId).maybeSingle()
    const balanceText = user ? `現在の残高: ${user.coin_balance ?? 0}コイン` : ''
    await reply(replyToken, [{
      type: 'text',
      text: `✅ ${typeLabel}\n受付番号: ${reportNumber}\n${coins}コインを付与しました！\n${balanceText}`,
    }])
    return
  }

  if (data === 'confirm_cancel') {
    await clearSession(lineUserId)
    await reply(replyToken, [{ type: 'text', text: 'キャンセルしました。また「通報」と送ってください。' }])
    return
  }

  if (data === 'skip_photo') {
    if (state === 'photo_request') {
      await setSession(lineUserId, 'location_request', context)
      await reply(replyToken, [
        qrText('現在地を送ってください。',
          [pb('なし（場所なし）', 'skip_location', 'なし（場所なし）')]),
      ])
    } else {
      const newCtx = { ...context, photo_url: null }
      await setSession(lineUserId, 'confirm', newCtx)
      await reply(replyToken, [buildConfirmFlex(newCtx)])
    }
    return
  }

  if (data === 'skip_location') {
    await setSession(lineUserId, 'confirm', context)
    await reply(replyToken, [buildConfirmFlex(context)])
    return
  }

  // ─ select_type ─
  if (state === 'select_type') {
    if (data === 'type_infra') {
      await setSession(lineUserId, 'infra_category', { report_type: 'infrastructure' })
      await reply(replyToken, [
        qrText('どんな問題ですか？',
          [pb('道路（陥没・落石）', 'cat_road'), pb('街灯の故障', 'cat_streetlight'),
           pb('公園・遊具', 'cat_park'), pb('除雪', 'cat_snow'), pb('その他', 'cat_other')]),
      ])
    } else if (data === 'type_shop') {
      await setSession(lineUserId, 'shop_select', { report_type: 'realtime_info' })
      await reply(replyToken, [{ type: 'text', text: 'お店の名前を教えてください。' }])
    } else if (data === 'type_weather') {
      await setSession(lineUserId, 'weather_input', { report_type: 'realtime_info', category: 'weather' })
      await reply(replyToken, [{ type: 'text', text: '道路・天候の状況を教えてください。' }])
    } else if (data === 'type_other') {
      await setSession(lineUserId, 'other_input', { report_type: 'realtime_info', category: 'other_info' })
      await reply(replyToken, [{ type: 'text', text: '情報の内容を教えてください。' }])
    }
    return
  }

  // ─ infra_category ─
  if (state === 'infra_category') {
    const catMap: Record<string, string> = {
      cat_road: 'road', cat_streetlight: 'streetlight', cat_park: 'park', cat_snow: 'snow', cat_other: 'other',
    }
    const category = catMap[data]
    if (category) {
      const newCtx = { ...context, category }
      await setSession(lineUserId, 'photo_request', newCtx)
      await reply(replyToken, [
        qrText('写真を送ってください（任意）。',
          [pb('スキップ', 'skip_photo', 'スキップ（写真なし）')]),
      ])
    }
    return
  }

  // ─ shop_status ─
  if (state === 'shop_status') {
    const catMap: Record<string, string> = {
      shop_closed: 'shop_closed', shop_hours: 'shop_hours',
      shop_crowded: 'shop_crowded', shop_other: 'other_info',
    }
    const category = catMap[data]
    if (category) {
      const newCtx = { ...context, category }
      await setSession(lineUserId, 'description_request', newCtx)
      await reply(replyToken, [{ type: 'text', text: '詳しい状況を教えてください。' }])
    }
    return
  }

  // ─ shop_select の確認 ─
  if (state === 'shop_select') {
    if (data.startsWith('shop_confirm:')) {
      const spotId = data.split(':')[1]
      const spotName = data.split(':')[2] ?? ''
      const newCtx = { ...context, spot_id: spotId, spot_name: spotName }
      await setSession(lineUserId, 'shop_status', newCtx)
      await reply(replyToken, [
        qrText('どんな情報ですか？',
          [pb('臨時休業', 'shop_closed'), pb('営業時間変更', 'shop_hours'),
           pb('混雑している', 'shop_crowded'), pb('その他', 'shop_other')]),
      ])
    } else if (data === 'shop_other_name') {
      // すでにshop_selectに戻る → テキスト待ち
      await reply(replyToken, [{ type: 'text', text: 'もう一度お店の名前を入力してください。' }])
    }
    return
  }
}

// ─── 画像メッセージ処理 ──────────────────────────────────────

async function handleImage(
  lineUserId: string, replyToken: string,
  state: SessionState, context: SessionContext, messageId: string,
) {
  if (state === 'photo_request' || state === 'photo_optional') {
    await reply(replyToken, [{ type: 'text', text: '写真をアップロード中...' }])
    const photoUrl = await uploadPhoto(messageId, lineUserId)
    const newCtx = { ...context, photo_url: photoUrl }

    if (state === 'photo_request') {
      await setSession(lineUserId, 'location_request', newCtx)
      await reply(replyToken, [
        qrText('位置情報を送ってください（任意）。',
          [pb('なし（場所なし）', 'skip_location', 'なし（場所なし）')]),
      ])
    } else {
      await setSession(lineUserId, 'confirm', newCtx)
      await reply(replyToken, [buildConfirmFlex(newCtx)])
    }
  } else if (state === 'idle') {
    await reply(replyToken, [
      qrText('写真を受け取りました。通報として送りますか？',
        [pb('通報・情報を送る', 'report_start', '通報する')]),
    ])
  } else {
    await reply(replyToken, [{ type: 'text', text: '写真を送るタイミングが違います。「通報」と送ってやり直してください。' }])
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
    await reply(replyToken, [{ type: 'text', text: 'ボタンから選んでください。' }])
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
      qrText('どんな情報ですか？',
        [pb('臨時休業', 'shop_closed'), pb('営業時間変更', 'shop_hours'),
         pb('混雑している', 'shop_crowded'), pb('その他', 'shop_other')]),
    ])
  }
}

// ─── 通報開始 ────────────────────────────────────────────────

async function handleStartReport(lineUserId: string, replyToken: string) {
  await setSession(lineUserId, 'select_type', {})
  await reply(replyToken, [
    qrText('どんな情報ですか？',
      [pb('インフラ通報', 'type_infra'), pb('お店の情報', 'type_shop'),
       pb('道路・天候', 'type_weather'), pb('その他の情報', 'type_other')]),
  ])
}

// ─── コイン残高確認 ──────────────────────────────────────────

async function handleCoinBalance(lineUserId: string, replyToken: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('coin_balance')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

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
