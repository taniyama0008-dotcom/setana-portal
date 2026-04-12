import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const metadata: Metadata = {
  title: 'せたな町の求人・しごと｜移住者向け仕事情報',
  description: '北海道せたな町の求人情報。正規雇用・季節労働・地域おこし協力隊まで、せたなで働く仕事一覧。',
}

const typeLabel: Record<string, string> = {
  regular:   '正規・パート',
  seasonal:  '季節',
  volunteer: '協力隊',
}

const typeColor: Record<string, string> = {
  regular:   '#5b7e95',
  seasonal:  '#6b8f71',
  volunteer: '#c47e4f',
}

export default async function WorkPage() {
  const [{ data: jobs }, { count: kyoryokutaiCount }] = await Promise.all([
    supabaseAdmin
      .from('jobs')
      .select('*, spots(name)')
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('kyoryokutai_listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
  ])

  const list = jobs ?? []

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'せたな町の求人・しごと',
            url: 'https://www.setana.life/life/work',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
                { '@type': 'ListItem', position: 2, name: '暮らす', item: 'https://www.setana.life/life' },
                { '@type': 'ListItem', position: 3, name: 'しごと・求人', item: 'https://www.setana.life/life/work' },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5c3320] via-[#c47e4f] to-[#8a5535]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/life" className="hover:text-white/70 transition-colors">暮らす</Link>
            <span>›</span>
            <span className="text-white/70">しごと・求人</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">WORK</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] leading-[1.3] tracking-[0.02em]">
            しごと・求人
          </h1>
          <p className="text-white/60 text-[14px] mt-2">せたなで働く、せたなで生きる。</p>
        </div>
      </section>

      <div className="max-w-[860px] mx-auto px-5 lg:px-8 py-16 lg:py-24">
        {/* 協力隊バナー */}
        {(kyoryokutaiCount ?? 0) > 0 && (
          <div className="mb-10 flex items-center justify-between gap-4 bg-[#f0f5f0] border border-[#6b8f71]/30 rounded-[10px] px-5 py-4">
            <div>
              <p className="text-[11px] font-medium tracking-[0.15em] text-[#6b8f71] mb-1 nav-label">COMMUNITY SUPPORTER</p>
              <p className="text-[14px] font-bold text-[#1a1a1a]">地域おこし協力隊の詳しい情報はこちら</p>
            </div>
            <Link
              href="/kyoryokutai"
              className="shrink-0 px-4 py-2 bg-[#6b8f71] hover:bg-[#4a6b50] text-white text-[13px] font-medium rounded-[8px] transition-colors nav-label"
            >
              募集一覧 →
            </Link>
          </div>
        )}

        {/* 求人タイプ凡例 */}
        <div className="flex flex-wrap gap-3 mb-10">
          {Object.entries(typeLabel).map(([key, label]) => (
            <span
              key={key}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${typeColor[key]}18`, color: typeColor[key] }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor[key] }} />
              {label}
            </span>
          ))}
        </div>

        {/* 求人一覧 */}
        {list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#8a8a8a] text-[15px] mb-3">現在募集中の求人はありません。</p>
            <p className="text-[#8a8a8a] text-[13px]">求人情報は事業者管理画面から登録できます。</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[#8a8a8a] text-[13px] mb-6">{list.length}件の求人</p>
            {list.map((job: any) => (
              <article
                key={job.id}
                className="bg-white border border-[#efefef] rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${typeColor[job.type] ?? '#8a8a8a'}18`,
                          color: typeColor[job.type] ?? '#8a8a8a',
                        }}
                      >
                        {typeLabel[job.type] ?? job.type}
                      </span>
                      {job.spots?.name && (
                        <span className="text-[12px] text-[#8a8a8a]">{job.spots.name}</span>
                      )}
                    </div>
                    <h2 className="text-[16px] font-bold text-[#1a1a1a] leading-[1.5] mb-2">{job.title}</h2>
                    {job.salary_range && (
                      <p className="text-[13px] text-[#5b7e95] font-medium mb-2">給与: {job.salary_range}</p>
                    )}
                    {job.description && (
                      <p className="text-[14px] text-[#5c5c5c] leading-[1.8] line-clamp-3">{job.description}</p>
                    )}
                  </div>
                  {job.contact_info && (
                    <div className="shrink-0">
                      <p className="text-[12px] text-[#8a8a8a] mb-1">問い合わせ</p>
                      <p className="text-[13px] text-[#1a1a1a]">{job.contact_info}</p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
