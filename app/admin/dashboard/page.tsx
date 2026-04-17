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
    { label: '판매 중 상품', value: totalProducts ?? 0, color: 'bg-[#5C4A2A]', href: '/admin/products' },
    { label: '품절 상품', value: soldoutProducts ?? 0, color: 'bg-[#9C9189]', href: '/admin/products?filter=soldout' },
    { label: '미답변 문의', value: pendingInquiries ?? 0, color: 'bg-amber-600', href: '/admin/inquiries' },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-8">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block">
            <div className={`${s.color} text-white rounded-xl p-6 hover:opacity-90 transition`}>
              <p className="text-sm mb-2 opacity-80">{s.label}</p>
              <p className="text-4xl font-bold">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 빠른 작업 */}
      <div className="mb-10">
        <h2 className="font-semibold text-[#5C4A2A] mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="bg-[#5C4A2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#8B6F47] transition text-sm"
          >
            + 상품 등록하기
          </Link>
          <Link
            href="/admin/inquiries"
            className="border border-[#5C4A2A] text-[#5C4A2A] font-semibold px-6 py-3 rounded-xl hover:bg-[#E8DFD0] transition text-sm"
          >
            문의 확인하기
          </Link>
        </div>
      </div>

      {/* 최근 문의 */}
      <div>
        <h2 className="font-semibold text-[#5C4A2A] mb-4">최근 문의</h2>
        {recentInquiries && recentInquiries.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="bg-white border border-[#E8DFD0] rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2D2416] text-sm">{inq.customer_name} · {inq.phone}</p>
                  <p className="text-xs text-[#9C9189] mt-0.5 line-clamp-1">{inq.message}</p>
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
          <p className="text-sm text-[#9C9189]">문의가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
