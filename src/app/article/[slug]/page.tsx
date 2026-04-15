import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'
import type { Article } from '@/lib/types'
import ShareButtons from '@/components/spot/ShareButtons'

const BASE_URL = 'https://www.setana.life'

const sectionConfig = {
  kurashi: { label: '暮らし', color: '#5b7e95', href: '/life' },
  shoku:   { label: '食',     color: '#c47e4f', href: '/travel/gourmet' },
  shizen:  { label: '自然',   color: '#6b8f71', href: '/travel/nature' },
}

async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'public')
    .single()
  return data as Article | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: '記事が見つかりません' }

  const description = article.excerpt ?? article.content?.slice(0, 120) ?? ''
  return {
    title: article.title,
    description,
    alternates: { canonical: `${BASE_URL}/article/${slug}` },
    openGraph: {
      title: `${article.title} | SETANA`,
      description,
      url: `${BASE_URL}/article/${slug}`,
      images: article.cover_image ? [{ url: article.cover_image }] : [],
      siteName: 'SETANA',
      locale: 'ja_JP',
      type: 'article',
    },
  }
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const sec = sectionConfig[article.section as keyof typeof sectionConfig] ?? sectionConfig.kurashi
  const pageUrl = `${BASE_URL}/article/${slug}`

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.cover_image ?? undefined,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: article.author_name
      ? { '@type': 'Person', name: article.author_name }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'SETANA',
      url: BASE_URL,
    },
    url: pageUrl,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: sec.label, item: `${BASE_URL}${sec.href}` },
      { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* カバー画像 */}
      {article.cover_image && (
        <div className="relative w-full aspect-[16/7] overflow-hidden">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      <div className="max-w-[680px] mx-auto px-5 lg:px-8 py-12">
        {/* パンくずリスト */}
        <nav className="flex items-center gap-1.5 text-[12px] text-[#8a8a8a] nav-label mb-8 flex-wrap" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">ホーム</Link>
          <span>/</span>
          <Link href={sec.href} className="hover:text-[#1a1a1a] transition-colors">{sec.label}</Link>
          <span>/</span>
          <span className="text-[#5c5c5c] line-clamp-1">{article.title}</span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="inline-block px-2.5 py-1 rounded text-white text-[11px] font-medium"
              style={{ backgroundColor: sec.color }}
            >
              {sec.label}
            </span>
            <time className="text-[13px] text-[#8a8a8a]" dateTime={article.created_at}>
              {formatDate(article.created_at)}
            </time>
            {article.author_name && (
              <span className="text-[13px] text-[#8a8a8a]">{article.author_name}</span>
            )}
          </div>

          <h1 className="text-[26px] lg:text-[30px] font-bold text-[#1a1a1a] leading-[1.4] tracking-[0.02em] mb-6">
            {article.title}
          </h1>

          {/* SNSシェア */}
          <ShareButtons url={pageUrl} title={article.title} />
        </header>

        {/* 抜粋 */}
        {article.excerpt && (
          <p className="text-[15px] text-[#5c5c5c] leading-[1.9] tracking-[0.06em] mb-10 pb-10 border-b border-[#efefef]">
            {article.excerpt}
          </p>
        )}

        {/* 本文 */}
        {article.content && (
          <div className="article-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-[24px] font-bold text-[#1a1a1a] mt-12 mb-5 tracking-[0.02em]">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[20px] font-semibold text-[#1a1a1a] mt-10 mb-4 tracking-[0.02em]">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[17px] font-semibold text-[#1a1a1a] mt-8 mb-3 tracking-[0.02em]">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em] mb-6">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[15px] text-[#1a1a1a] leading-[1.8] tracking-[0.05em]">{children}</li>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-[#5b7e95] underline underline-offset-2 hover:text-[#3d5a6e] transition-colors" target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#5b7e95] pl-5 my-8 text-[#5c5c5c] italic">{children}</blockquote>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-')
                  return isBlock ? (
                    <code className="block bg-[#1a1a1a] text-[#f5f5f5] rounded-[6px] px-5 py-4 overflow-x-auto text-[13px] font-mono leading-[1.7]">{children}</code>
                  ) : (
                    <code className="bg-[#f0f0f0] text-[#1a1a1a] rounded px-1.5 py-0.5 text-[13px] font-mono">{children}</code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="mb-6 overflow-x-auto">{children}</pre>
                ),
                img: ({ src, alt }) =>
                  src && typeof src === 'string' ? (
                    <span className="block my-8">
                      <Image
                        src={src}
                        alt={alt ?? ''}
                        width={680}
                        height={400}
                        className="w-full rounded-[8px] object-cover"
                        unoptimized
                      />
                      {alt && (
                        <span className="block text-center text-[12px] text-[#8a8a8a] mt-2">{alt}</span>
                      )}
                    </span>
                  ) : null,
                hr: () => <hr className="border-[#e0e0e0] my-12" />,
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#1a1a1a]">{children}</strong>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse text-[14px]">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-[#e0e0e0] bg-[#faf8f5] px-4 py-2.5 text-left font-semibold text-[#1a1a1a]">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-[#e0e0e0] px-4 py-2.5 text-[#1a1a1a]">{children}</td>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        )}

        {/* フッターシェア */}
        <div className="mt-12 pt-8 border-t border-[#e0e0e0]">
          <p className="text-[13px] text-[#8a8a8a] mb-3">この記事をシェアする</p>
          <ShareButtons url={pageUrl} title={article.title} />
        </div>

        {/* セクションへ戻る */}
        <div className="mt-10">
          <Link
            href={sec.href}
            className="inline-flex items-center gap-2 text-[14px] text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors"
          >
            <span>←</span>
            <span>{sec.label}の記事一覧へ戻る</span>
          </Link>
        </div>
      </div>
    </>
  )
}
