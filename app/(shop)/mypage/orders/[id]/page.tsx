import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { OrderWithItems } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  shipping: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
}

const STATUS_STEPS = ['paid', 'shipping', 'delivered']
const STATUS_STEP_LABEL: Record<string, string> = {
  paid: '결제 완료',
  shipping: '배송 중',
  delivered: '배송 완료',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/mypage')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const o = order as OrderWithItems
  const currentStep = STATUS_STEPS.indexOf(o.status)
  const isCancelled = o.status === 'cancelled'
  const isPending = o.status === 'pending'

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link href="/mypage" className="text-xs text-ink-muted hover:text-ink mb-8 inline-block tracking-widest uppercase">
        ← 마이페이지
      </Link>

      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-xs tracking-widest text-ink-muted uppercase mb-1">Order Detail</p>
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-ink">주문 상세</h1>
          <span className="text-xs text-ink-faint">#{o.order_number}</span>
        </div>
        <p className="text-xs text-ink-muted mt-1">
          {new Date(o.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* 배송 진행 상태 */}
      {!isCancelled && !isPending && (
        <div className="mb-8">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep
              const isLast = i === STATUS_STEPS.length - 1
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${done ? 'bg-ink border-ink' : 'bg-white border-line'}`} />
                    <span className={`text-[10px] tracking-wide whitespace-nowrap ${done ? 'text-ink font-medium' : 'text-ink-faint'}`}>
                      {STATUS_STEP_LABEL[step]}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-px mb-3 mx-1 ${i < currentStep ? 'bg-ink' : 'bg-line'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mb-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
          취소된 주문입니다.
        </div>
      )}

      {/* 주문 상품 */}
      <section className="mb-6">
        <p className="text-xs tracking-widest text-ink-muted uppercase mb-3">주문 상품</p>
        <div className="flex flex-col divide-y divide-line border-t border-b border-line">
          {o.order_items.map((item) => (
            <div key={item.id} className="flex gap-3 py-4">
              {item.image_url ? (
                <Link href={`/products/${item.product_slug}`} className="relative w-16 h-20 shrink-0 bg-line overflow-hidden">
                  <Image src={item.image_url} alt={item.product_name} fill className="object-cover" sizes="64px" />
                </Link>
              ) : (
                <div className="w-16 h-20 shrink-0 bg-line" />
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product_slug}`} className="text-sm font-medium text-ink hover:underline line-clamp-2">
                  {item.product_name}
                </Link>
                {(item.option_color || item.option_size) && (
                  <p className="text-xs text-ink-muted mt-0.5">
                    {[item.option_color, item.option_size].filter(Boolean).join(' / ')}
                  </p>
                )}
                <p className="text-xs text-ink-muted mt-0.5">수량 {item.quantity}개</p>
                <p className="text-sm font-medium text-ink mt-1">
                  {(item.price * item.quantity).toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 결제 금액 */}
      <section className="mb-6">
        <p className="text-xs tracking-widest text-ink-muted uppercase mb-3">결제 금액</p>
        <div className="flex flex-col gap-2 text-sm border-t border-b border-line py-4">
          <div className="flex justify-between text-ink-sub">
            <span>상품 금액</span>
            <span>{(o.total_amount - o.delivery_fee).toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-ink-sub">
            <span>배송비</span>
            <span>{o.delivery_fee === 0 ? '무료' : `${o.delivery_fee.toLocaleString()}원`}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink pt-2 border-t border-line mt-1">
            <span>합계</span>
            <span>{o.total_amount.toLocaleString()}원</span>
          </div>
        </div>
      </section>

      {/* 배송지 */}
      <section className="mb-6">
        <p className="text-xs tracking-widest text-ink-muted uppercase mb-3">배송지</p>
        <div className="text-sm text-ink-sub border-t border-b border-line py-4 flex flex-col gap-1">
          <p className="font-medium text-ink">{o.customer_name}</p>
          <p>{o.customer_phone}</p>
          <p>{o.customer_address}</p>
          {o.customer_memo && <p className="text-ink-muted text-xs mt-1">메모: {o.customer_memo}</p>}
        </div>
      </section>

      {/* 결제 방법 */}
      {o.payment_method && (
        <section>
          <p className="text-xs tracking-widest text-ink-muted uppercase mb-3">결제 방법</p>
          <p className="text-sm text-ink-sub border-t border-b border-line py-4">{o.payment_method}</p>
        </section>
      )}
    </div>
  )
}
