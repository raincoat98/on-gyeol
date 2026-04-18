import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { OrderWithItems } from '@/types'
import LogoutButton from '@/components/shop/LogoutButton'

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  shipping: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
}

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/mypage')

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-8">마이페이지</h1>

      {/* 프로필 */}
      <section className="bg-[#EFEFEF] rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#2D2416]">{profile?.full_name ?? '회원'}</p>
          <p className="text-sm text-[#9C9189]">{user.email}</p>
          {profile?.phone && <p className="text-sm text-[#9C9189]">{profile.phone}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link
            href="/mypage/profile"
            className="text-xs text-[#8B6F47] border border-[#E5E5EA] px-3 py-1.5 rounded-full hover:bg-white transition"
          >
            프로필 수정
          </Link>
          <LogoutButton />
        </div>
      </section>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/mypage/addresses"
          className="bg-white border border-[#E5E5EA] rounded-xl p-4 text-center hover:border-[#8B6F47] transition"
        >
          <p className="text-2xl mb-1">📦</p>
          <p className="text-sm font-medium text-[#5C4A2A]">배송지 관리</p>
        </Link>
        <Link
          href="/contact"
          className="bg-white border border-[#E5E5EA] rounded-xl p-4 text-center hover:border-[#8B6F47] transition"
        >
          <p className="text-2xl mb-1">💬</p>
          <p className="text-sm font-medium text-[#5C4A2A]">1:1 문의</p>
        </Link>
      </div>

      {/* 주문 내역 */}
      <section>
        <h2 className="text-base font-semibold text-[#5C4A2A] mb-4">주문 내역</h2>
        {!orders || orders.length === 0 ? (
          <div className="text-center py-12 text-[#9C9189] bg-[#EFEFEF] rounded-xl">
            <p>주문 내역이 없습니다.</p>
            <Link href="/products" className="inline-block mt-3 text-sm text-[#5C4A2A] underline">
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(orders as OrderWithItems[]).map((order) => (
              <div key={order.id} className="bg-white border border-[#E5E5EA] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-[#9C9189]">주문번호: {order.order_number}</span>
                    <p className="text-xs text-[#9C9189]">
                      {new Date(order.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.status === 'paid' || order.status === 'shipping' || order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-500'
                      : 'bg-[#EFEFEF] text-[#8B6F47]'
                  }`}>
                    {ORDER_STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[#2D2416]">
                        {item.product_name}
                        {(item.option_color || item.option_size) && (
                          <span className="text-[#9C9189] ml-1">
                            ({[item.option_color, item.option_size].filter(Boolean).join('/')})
                          </span>
                        )}
                        {' '}×{item.quantity}
                      </span>
                      <span className="text-[#5C4A2A] font-medium">
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E5E5EA] mt-3 pt-2 flex justify-between text-sm font-bold text-[#2D2416]">
                  <span>합계</span>
                  <span>{order.total_amount.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
