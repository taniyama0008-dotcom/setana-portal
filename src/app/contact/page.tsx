import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ | SETANA',
  description: 'SETANAへのお問い合わせ、掲載依頼、取材相談はこちら。',
}

export default function ContactPage() {
  return (
    <div className="max-w-[680px] mx-auto px-5 lg:px-8 py-20">
      <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-[0.02em] mb-10">
        お問い合わせ
      </h1>

      <div className="space-y-6 text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.04em]">
        <p>
          SETANAに関するお問い合わせ、掲載のご依頼、<br />
          取材のご相談などはこちらからお願いいたします。
        </p>

        <div className="flex gap-4 text-[14px] text-[#5c5c5c]">
          <span className="text-[#8a8a8a] shrink-0">メール</span>
          <span>[メールアドレスを後で入れる]</span>
        </div>

        <p className="text-[13px] text-[#8a8a8a] leading-[1.8]">
          ※ 掲載内容の修正依頼、口コミに関するご連絡もこちらで受け付けております。
        </p>
      </div>
    </div>
  )
}
