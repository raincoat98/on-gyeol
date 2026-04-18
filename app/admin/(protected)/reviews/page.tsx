import { createClient } from '@/lib/supabase/server'
import StarRating from '@/components/shop/StarRating'

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, products(name, slug)')
    .order('created_at', { ascending: false })
    .limit(100)

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="p-8">
      <div className="flex items-baseline gap-3 mb-8">
        <h1 className="text-xl font-semibold text-ink tracking-tight">리뷰 관리</h1>
        {avgRating && (
          <span className="text-sm text-ink-muted">평균 ★ {avgRating} ({reviews?.length}개)</span>
        )}
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => {
            const product = review.products as { name: string; slug: string } | null
            return (
              <div key={review.id} className="bg-white border border-line p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <StarRating value={review.rating} size="sm" />
                    {product && (
                      <span className="text-xs text-ink-muted">{product.name}</span>
                    )}
                  </div>
                  <span className="text-xs text-ink-faint">
                    {new Date(review.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-ink leading-relaxed">{review.content}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-ink-muted py-24 text-sm">등록된 리뷰가 없습니다.</p>
      )}
    </div>
  )
}
