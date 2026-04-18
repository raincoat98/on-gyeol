import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Review } from '@/types'
import StarRating from '@/components/shop/StarRating'

export default async function MyReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/mypage/reviews')

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, products(name, slug, product_images(image_url, is_main))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/mypage" className="text-xs text-ink-muted hover:text-ink mb-8 inline-block tracking-widest uppercase">
        ← 마이페이지
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-widest text-ink-muted uppercase mb-1">My Reviews</p>
        <h1 className="text-xl font-semibold text-ink">내 리뷰</h1>
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-sm mb-4">작성한 리뷰가 없습니다.</p>
          <Link href="/mypage" className="text-xs border border-ink text-ink px-6 py-2.5 hover:bg-ink hover:text-white transition">
            마이페이지로
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {reviews.map((review) => {
            const product = review.products as { name: string; slug: string; product_images: { image_url: string; is_main: boolean }[] } | null
            const mainImage = product?.product_images?.find((i) => i.is_main) ?? product?.product_images?.[0]
            return (
              <div key={review.id} className="py-5 flex gap-4">
                {mainImage && (
                  <Link href={`/products/${product?.slug}`} className="relative w-16 h-20 flex-shrink-0 bg-line overflow-hidden">
                    <Image src={mainImage.image_url} alt={product?.name ?? ''} fill className="object-cover" sizes="64px" />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product?.slug}`} className="text-sm font-medium text-ink hover:underline">
                    {product?.name}
                  </Link>
                  <div className="mt-1 mb-2">
                    <StarRating value={review.rating} size="sm" />
                  </div>
                  <p className="text-sm text-ink-sub leading-relaxed">{review.content}</p>
                  <p className="text-xs text-ink-faint mt-2">
                    {new Date(review.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
