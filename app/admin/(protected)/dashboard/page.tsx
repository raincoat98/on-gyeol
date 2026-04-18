import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: soldoutProducts },
    { count: pendingInquiries },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'soldout'),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const { data: recentInquiries } = await supabase
    .from('inquiries')
    .select('*, products(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: '판매 중 상품', value: totalProducts ?? 0, numColor: 'text-ink', href: '/admin/products' },
    { label: '품절 상품', value: soldoutProducts ?? 0, numColor: 'text-slate-500', href: '/admin/products?filter=soldout' },
    { label: '미답변 문의', value: pendingInquiries ?? 0, numColor: 'text-rose-500', href: '/admin/inquiries' },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-semibold text-ink mb-8 tracking-tight">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block group">
            <div className="bg-white border border-line rounded-2xl p-6 hover:shadow-md transition-shadow">
              <p className="text-xs text-ink-muted mb-3 font-medium uppercase tracking-wider">{s.label}</p>
              <p className={`text-4xl font-bold ${s.numColor}`}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 빠른 작업 */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-ink-muted mb-4 uppercase tracking-wider">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="bg-surface-dark text-white font-medium px-5 py-2.5 rounded-xl hover:bg-surface-hover transition text-sm"
          >
            + 상품 등록
          </Link>
          <Link
            href="/admin/orders"
            className="border border-line text-ink font-medium px-5 py-2.5 rounded-xl hover:bg-surface-muted transition text-sm"
          >
            주문 확인
          </Link>
          <Link
            href="/admin/inquiries"
            className="border border-line text-ink font-medium px-5 py-2.5 rounded-xl hover:bg-surface-muted transition text-sm"
          >
            문의 확인
          </Link>
        </div>
      </div>

      {/* 최근 문의 */}
      <div>
        <h2 className="text-sm font-semibold text-ink-muted mb-4 uppercase tracking-wider">최근 문의</h2>
        {recentInquiries && recentInquiries.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="bg-white border border-line rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink text-sm">{inq.customer_name} · {inq.phone}</p>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{inq.message}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  inq.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  inq.status === 'replied' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {inq.status === 'pending' ? '미답변' : inq.status === 'replied' ? '답변완료' : '종료'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">문의가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
