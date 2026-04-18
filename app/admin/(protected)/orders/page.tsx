import { createClient } from '@/lib/supabase/server'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'
import OrderDeliveryEditor from '@/components/admin/OrderDeliveryEditor'

const STATUS_LABELS = {
  pending: '결제대기',
  paid: '결제완료',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
} as const

type OrderStatus = keyof typeof STATUS_LABELS

type Log = {
  id: string
  action: string
  detail: string | null
  created_at: string
}

type OrderRow = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_memo: string | null
  total_amount: number
  delivery_fee: number
  status: OrderStatus
  created_at: string
  order_items: {
    id: string
    product_name: string
    option_color: string | null
    option_size: string | null
    quantity: number
    price: number
  }[]
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.status && params.status in STATUS_LABELS) {
    query = query.eq('status', params.status as OrderStatus)
  }

  const { data: orders } = await query as { data: OrderRow[] | null }

  const orderIds = (orders ?? []).map((o) => o.id)

  const [{ data: counts }, { data: allLogs }] = await Promise.all([
    supabase.from('orders').select('status'),
    orderIds.length > 0
      ? supabase
          .from('order_logs')
          .select('*')
          .in('order_id', orderIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  const logsByOrder = ((allLogs ?? []) as (Log & { order_id: string })[]).reduce<Record<string, Log[]>>(
    (acc, log) => {
      acc[log.order_id] = [...(acc[log.order_id] ?? []), log]
      return acc
    },
    {}
  )

  const countMap = (counts ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-ink mb-8 tracking-tight">주문 관리</h1>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <a
          href="/admin/orders"
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            !params.status ? 'bg-surface-dark text-white border-ink' : 'border-line text-ink-muted hover:border-ink hover:text-ink'
          }`}
        >
          전체 ({counts?.length ?? 0})
        </a>
        {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([v, label]) => (
          <a
            key={v}
            href={`?status=${v}`}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              params.status === v ? 'bg-surface-dark text-white border-ink' : 'border-line text-ink-muted hover:border-ink hover:text-ink'
            }`}
          >
            {label} ({countMap[v] ?? 0})
          </a>
        ))}
      </div>

      {orders && orders.length > 0 ? (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-line rounded-2xl p-5 hover:shadow-sm transition-shadow">
              {/* 주문 헤더 */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-ink text-sm">#{order.order_number}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('ko-KR', {
                      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  <p className="text-sm font-bold text-ink">
                    {order.total_amount.toLocaleString()}원
                  </p>
                  {order.delivery_fee > 0 && (
                    <p className="text-xs text-ink-muted">배송비 {order.delivery_fee.toLocaleString()}원 포함</p>
                  )}
                </div>
              </div>

              {/* 주문 상품 */}
              <div className="border-t border-surface pt-3 flex flex-col gap-1.5 mb-1">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-ink">
                      {item.product_name}
                      {(item.option_color || item.option_size) && (
                        <span className="text-ink-muted ml-1.5 text-xs">
                          {[item.option_color, item.option_size].filter(Boolean).join(' / ')}
                        </span>
                      )}
                    </span>
                    <span className="text-ink-muted whitespace-nowrap ml-4 text-xs">
                      {item.quantity}개 · {(item.price * item.quantity).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>

              {/* 배송정보 + 이력 */}
              <OrderDeliveryEditor
                orderId={order.id}
                orderNumber={order.order_number}
                name={order.customer_name}
                phone={order.customer_phone}
                address={order.customer_address}
                memo={order.customer_memo}
                logs={logsByOrder[order.id] ?? []}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-ink-muted py-24 text-sm">주문이 없습니다.</p>
      )}
    </div>
  )
}
