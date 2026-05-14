import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'
import ReviewEditForm from './ReviewEditForm'

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const userId = await getSessionUserId()
  if (!userId) redirect('/')

  const [{ data: review }, { data: images }] = await Promise.all([
    supabaseAdmin
      .from('reviews')
      .select('id, rating, comment, visit_year, visit_month, user_id, spots(name, slug)')
      .eq('id', id)
      .single(),
    supabaseAdmin
      .from('review_images')
      .select('id, image_url, alt_text')
      .eq('review_id', id),
  ])

  if (!review || review.user_id !== userId) redirect('/mypage')

  const spot = (Array.isArray(review.spots) ? review.spots[0] : review.spots) as { name: string; slug: string } | null

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-[680px] mx-auto px-5 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/mypage"
            className="text-[13px] text-[#5b7e95] hover:underline"
          >
            ← マイページに戻る
          </Link>
          <h1 className="text-[22px] font-semibold text-[#1a1a1a] mt-3 tracking-[0.02em]">
            口コミを編集
          </h1>
          {spot?.name && (
            <p className="text-[14px] text-[#5c5c5c] mt-1">{spot.name}</p>
          )}
        </div>

        <div className="bg-white rounded-[8px] border border-[#e0e0e0] p-6 lg:p-8">
          <ReviewEditForm
            reviewId={id}
            initialRating={review.rating}
            initialComment={review.comment ?? ''}
            initialVisitYear={review.visit_year ?? null}
            initialVisitMonth={review.visit_month ?? null}
            existingImages={images ?? []}
          />
        </div>
      </div>
    </div>
  )
}
