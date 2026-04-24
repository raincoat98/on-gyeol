import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RefreshButton from '@/components/admin/RefreshButton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    { count: pendingInquiries },
    { count: paidOrders },
    { data: todayOrders },
    { data: recentInquiries },
    { data: recentPaidOrders },
  ] = await Promise.all([
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase.from('orders').select('total_amount').gte('created_at', todayStart.toISOString()).neq('status', 'cancelled'),
    supabase.from('inquiries')
      .select('*, products(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('orders')
      .select('*, order_items(*)')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const todayCount = todayOrders?.length ?? 0
  const todayRevenue = todayOrders?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0

  const stats = [
    {
      label: '오늘 주문',
      value: todayCount,
      sub: `${todayRevenue.toLocaleString()}원`,
      numColor: 'text-ink',
      href: '/admin/orders',
    },
    {
      label: '결제완료 (처리 필요)',
      value: paidOrders ?? 0,
      sub: '배송 준비 대기',
      numColor: paidOrders ? 'text-blue-600' : 'text-ink',
      href: '/admin/orders?status=paid',
    },
    {
      label: '미답변 문의',
      value: pendingInquiries ?? 0,
      sub: '답변 필요',
      numColor: pendingInquiries ? 'text-rose-500' : 'text-ink',
      href: '/admin/inquiries?status=pending',
    },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-ink tracking-tight">대시보드</h1>
        <RefreshButton />
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block group">
            <div className="bg-white border border-line rounded-2xl p-6 hover:shadow-md transition-shadow">
              <p className="text-xs text-ink-muted mb-3 font-medium">{s.label}</p>
              <p className={`text-4xl font-bold ${s.numColor}`}>{s.value}</p>
              <p className="text-xs text-ink-faint mt-2">{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 결제완료 주문 */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">처리 필요 주문 (결제완료)</h2>
          <Link href="/admin/orders?status=paid" className="text-xs text-ink-muted hover:text-ink transition">
            전체 보기 →
          </Link>
        </div>
        {recentPaidOrders && recentPaidOrders.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentPaidOrders.map((order) => {
              const o = order as {
                id: string
                order_number: string
                customer_name: string
                total_amount: number
                created_at: string
                order_items: { product_name: string; quantity: number }[]
              }
              return (
                <Link
                  key={o.id}
                  href="/admin/orders?status=paid"
                  className="bg-white border border-line rounded-xl px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-medium text-ink text-sm">
                      #{o.order_number} · {o.customer_name}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                      {o.order_items?.[0]?.product_name}
                      {o.order_items?.length > 1 && ` 외 ${o.order_items.length - 1}건`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-bold text-ink">{o.total_amount.toLocaleString()}원</p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-ink-muted bg-white border border-line rounded-xl px-5 py-6 text-center">
            처리 대기 중인 주문이 없습니다.
          </p>
        )}
      </div>

      {/* 미답변 문의 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">미답변 문의</h2>
          <Link href="/admin/inquiries?status=pending" className="text-xs text-ink-muted hover:text-ink transition">
            전체 보기 →
          </Link>
        </div>
        {recentInquiries && recentInquiries.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentInquiries.map((inq) => (
              <Link
                key={inq.id}
                href="/admin/inquiries?status=pending"
                className="bg-white border border-line rounded-xl px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-medium text-ink text-sm">{inq.customer_name} · {inq.phone}</p>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{inq.message}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium shrink-0 ml-4">
                  미답변
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted bg-white border border-line rounded-xl px-5 py-6 text-center">
            미답변 문의가 없습니다.
          </p>
        )}
      </div>
    </div>
  )
}
