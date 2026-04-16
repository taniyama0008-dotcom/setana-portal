import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | SETANA',
  description: 'SETANAのプライバシーポリシー。個人情報の取り扱いについて。',
}

const sections = [
  {
    title: '1. 個人情報の収集について',
    body: '当サイトでは、お問い合わせやレビュー投稿の際に、メールアドレス・ニックネーム等の個人情報をご提供いただく場合があります。',
  },
  {
    title: '2. 個人情報の利用目的',
    body: '収集した個人情報は、以下の目的で利用いたします。',
    list: [
      'お問い合わせへの回答',
      'サービスの運営・改善',
      '統計データの作成（個人を特定しない形式）',
    ],
  },
  {
    title: '3. 個人情報の第三者提供',
    body: '法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。',
  },
  {
    title: '4. アクセス解析ツールについて',
    body: '当サイトでは、Googleアナリティクスを使用しています。Googleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。詳しくは Google のプライバシーポリシーをご確認ください。',
  },
  {
    title: '5. 免責事項',
    body: '当サイトに掲載された情報の正確性には万全を期しておりますが、利用者が当サイトの情報を用いて行う一切の行為について責任を負いません。',
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-[680px] mx-auto px-5 lg:px-8 py-20">
      <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-[0.02em] mb-10">
        プライバシーポリシー
      </h1>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3 tracking-[0.02em]">
              {s.title}
            </h2>
            <p className="text-[14px] text-[#3a3a3a] leading-[1.9] tracking-[0.04em]">
              {s.body}
            </p>
            {s.list && (
              <ul className="mt-3 space-y-1 pl-4">
                {s.list.map((item) => (
                  <li key={item} className="text-[14px] text-[#3a3a3a] leading-[1.9] tracking-[0.04em] list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section>
          <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3 tracking-[0.02em]">
            6. お問い合わせ
          </h2>
          <p className="text-[14px] text-[#3a3a3a] leading-[1.9] tracking-[0.04em]">
            プライバシーポリシーに関するお問い合わせは{' '}
            <Link href="/contact" className="text-[#5b7e95] hover:underline">
              お問い合わせページ
            </Link>
            {' '}よりお願いいたします。
          </p>
        </section>
      </div>

      <p className="mt-14 text-[12px] text-[#8a8a8a]">制定日: 2025年4月</p>
    </div>
  )
}
