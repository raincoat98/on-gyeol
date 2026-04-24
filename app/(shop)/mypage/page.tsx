import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { OrderWithItems } from '@/types'
import LogoutButton from '@/components/shop/LogoutButton'
import StarRating from '@/components/shop/StarRating'
import { Package, MessageCircle, ChevronRight, Star } from 'lucide-react'

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  shipping: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
}

const ORDER_STATUS_STYLE: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-600',
  shipping: 'bg-blue-50 text-blue-600',
  delivered: 'bg-surface-muted text-ink-muted',
  cancelled: 'bg-red-50 text-red-400',
  pending: 'bg-surface-muted text-ink-sub',
}

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/mypage')

  const [{ data: profile }, { data: orders }, { data: inquiries }, { data: reviews }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('inquiries')
      .select('*, products(name, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('reviews')
      .select('order_item_id')
      .eq('user_id', user.id),
  ])

  const reviewedItemIds = new Set((reviews ?? []).map((r) => r.order_item_id).filter(Boolean))

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* 프로필 */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className="text-xs text-ink-muted mb-1 tracking-widest uppercase">My Account</p>
            <p className="text-xl font-semibold text-ink">{profile?.full_name ?? '회원'}</p>
            <p className="text-sm text-ink-muted mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/mypage/profile"
              className="text-xs text-ink-sub hover:text-ink transition"
            >
              프로필 수정
            </Link>
            <span className="text-line">|</span>
            <LogoutButton />
          </div>
        </div>
        <div className="mt-4 h-px bg-line" />
      </section>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <Link
          href="/mypage/addresses"
          className="group flex items-center justify-between bg-white border border-line px-4 py-4 hover:border-ink transition"
        >
          <div className="flex items-center gap-2">
            <Package size={16} className="text-ink-muted group-hover:text-ink transition" />
            <span className="text-sm font-medium text-ink">배송지</span>
          </div>
          <ChevronRight size={14} className="text-ink-faint group-hover:text-ink-muted transition" />
        </Link>
        <Link
          href="/mypage/reviews"
          className="group flex items-center justify-between bg-white border border-line px-4 py-4 hover:border-ink transition"
        >
          <div className="flex items-center gap-2">
            <Star size={16} className="text-ink-muted group-hover:text-ink transition" />
            <span className="text-sm font-medium text-ink">내 리뷰</span>
          </div>
          <ChevronRight size={14} className="text-ink-faint group-hover:text-ink-muted transition" />
        </Link>
        <Link
          href="/contact"
          className="group flex items-center justify-between bg-white border border-line px-4 py-4 hover:border-ink transition"
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-ink-muted group-hover:text-ink transition" />
            <span className="text-sm font-medium text-ink">1:1 문의</span>
          </div>
          <ChevronRight size={14} className="text-ink-faint group-hover:text-ink-muted transition" />
        </Link>
      </div>

      {/* 주문 내역 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink tracking-wider uppercase">주문 내역</h2>
          <Link href="/mypage/orders" className="text-xs text-ink-muted hover:text-ink transition">
            전체 보기 →
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <p className="text-sm mb-4">아직 주문 내역이 없습니다.</p>
            <Link
              href="/products"
              className="inline-block text-xs font-medium text-ink border border-ink px-6 py-2.5 rounded-full hover:bg-ink hover:text-white transition"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {(orders as OrderWithItems[]).map((order) => (
              <div key={order.id} className="py-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_STYLE[order.status] ?? 'bg-surface-muted text-ink-sub'}`}>
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {new Date(order.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <Link href={`/mypage/orders/${order.id}`} className="text-[11px] text-ink-muted hover:text-ink transition">
                    #{order.order_number} →
                  </Link>
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                      <span className="text-ink flex-1 min-w-0">
                        {item.product_name}
                        {(item.option_color || item.option_size) && (
                          <span className="text-ink-muted text-xs ml-1.5">
                            {[item.option_color, item.option_size].filter(Boolean).join(' / ')}
                          </span>
                        )}
                        <span className="text-ink-muted text-xs ml-1.5">×{item.quantity}</span>
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-ink text-xs">
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>
                        {order.status === 'delivered' && (
                          reviewedItemIds.has(item.id) ? (
                            <span className="text-[10px] text-ink-muted border border-line px-2 py-0.5">리뷰 완료</span>
                          ) : (
                            <Link
                              href={`/mypage/reviews/write?order_item_id=${item.id}`}
                              className="text-[10px] border border-ink text-ink px-2 py-0.5 hover:bg-ink hover:text-white transition"
                            >
                              리뷰 쓰기
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs font-semibold text-ink">
                  <span>합계</span>
                  <span>{order.total_amount.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* 문의 내역 */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink tracking-wider uppercase">문의 내역</h2>
          <Link href="/contact" className="text-xs text-ink-muted hover:text-ink transition">
            새 문의 →
          </Link>
        </div>

        {!inquiries || inquiries.length === 0 ? (
          <div className="text-center py-10 text-ink-muted border-t border-line">
            <p className="text-sm">문의 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-line border-t border-line">
            {inquiries.map((inq) => {
              const product = inq.products as { name: string; slug: string } | null
              const statusLabel: Record<string, string> = { pending: '답변 대기', replied: '답변 완료', closed: '종료' }
              const statusStyle: Record<string, string> = {
                pending: 'bg-amber-50 text-amber-600',
                replied: 'bg-emerald-50 text-emerald-600',
                closed: 'bg-surface-muted text-ink-faint',
              }
              return (
                <div key={inq.id} className="py-5">
                  {/* 문의 */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-ink leading-relaxed flex-1">{inq.message}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyle[inq.status] ?? 'bg-surface-muted text-ink-muted'}`}>
                      {statusLabel[inq.status] ?? inq.status}
                    </span>
                  </div>
                  {product && (
                    <p className="text-xs text-ink-muted mb-1">상품: {product.name}</p>
                  )}
                  <p className="text-xs text-ink-faint">
                    {new Date(inq.created_at).toLocaleDateString('ko-KR')}
                  </p>
                  {/* 관리자 답변 */}
                  {inq.admin_reply && (
                    <div className="mt-3 bg-emerald-50 rounded-xl px-4 py-3">
                      <p className="text-[11px] font-semibold text-emerald-700 mb-1.5">답변</p>
                      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{inq.admin_reply}</p>
                      {inq.replied_at && (
                        <p className="text-xs text-ink-faint mt-2">
                          {new Date(inq.replied_at).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
