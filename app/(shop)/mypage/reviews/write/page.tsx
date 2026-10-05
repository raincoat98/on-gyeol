import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { apiFetch, apiFetchOrNull, apiFetchUser } from '@/lib/api/server'
import type { OrderItem, Review, User } from '@/types'
import ReviewForm from '@/components/shop/ReviewForm'

export default async function WriteReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ order_item_id?: string }>
}) {
  const { order_item_id } = await searchParams
  if (!order_item_id) notFound()

  const user = await apiFetchUser<User>()
  if (!user) redirect('/auth/login?next=/mypage/reviews')

  // 주문 아이템 검증: 본인 것, delivered 상태, 리뷰 미작성
  const item = await apiFetchOrNull<OrderItem>(`/order-items/${order_item_id}`)
  if (!item) notFound()

  const order = item.orders
  if (!order || order.user_id !== user.id) notFound()
  if (order.status !== 'delivered') notFound()

  const existing = await apiFetch<Review[]>(`/reviews?orderItemId=${order_item_id}&limit=1`)
  if (existing.length > 0) redirect('/mypage/reviews')

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link href="/mypage/reviews" className="text-xs text-ink-muted hover:text-ink mb-8 inline-block tracking-widest uppercase">
        ← 내 리뷰
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-widest text-ink-muted uppercase mb-1">Write Review</p>
        <h1 className="text-xl font-semibold text-ink">리뷰 작성</h1>
      </div>

      {/* 상품 요약 */}
      <div className="flex items-center gap-3 border border-line p-4 mb-8">
        {item.image_url && (
          <div className="relative w-14 h-16 flex-shrink-0 bg-line overflow-hidden">
            <Image src={item.image_url} alt={item.product_name} fill className="object-cover" sizes="56px" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-ink">{item.product_name}</p>
          {(item.option_color || item.option_size) && (
            <p className="text-xs text-ink-muted mt-0.5">
              {[item.option_color, item.option_size].filter(Boolean).join(' / ')}
            </p>
          )}
        </div>
      </div>

      <ReviewForm
        productId={item.product_id ?? ''}
        orderItemId={order_item_id}
        userId={user.id}
      />
    </div>
  )
}
