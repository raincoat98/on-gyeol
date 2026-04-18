'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'
import { useRouter } from 'next/navigation'
import type { OrderWithItems } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  shipping: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
}

const STATUS_STYLE: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-600',
  shipping: 'bg-blue-50 text-blue-600',
  delivered: 'bg-surface-muted text-ink-muted',
  cancelled: 'bg-red-50 text-red-400',
  pending: 'bg-surface-muted text-ink-sub',
}

const QUICK_RANGES = [
  { label: '1개월', months: 1 },
  { label: '3개월', months: 3 },
  { label: '6개월', months: 6 },
]

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function OrdersPage() {
  const router = useRouter()
  const { userId, hydrated } = useAuthStore()

  const today = toDateString(new Date())
  const threeMonthsAgo = toDateString(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))

  const [from, setFrom] = useState(threeMonthsAgo)
  const [to, setTo] = useState(today)
  const [keyword, setKeyword] = useState('')
  const [showCancelled, setShowCancelled] = useState(false)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = useCallback(async (fromDate: string, toDate: string) => {
    if (!userId) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .gte('created_at', `${fromDate}T00:00:00`)
      .lte('created_at', `${toDate}T23:59:59`)
      .order('created_at', { ascending: false })
    setOrders((data ?? []) as OrderWithItems[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!hydrated) return
    if (!userId) { router.push('/auth/login?next=/mypage/orders'); return }
    fetchOrders(from, to)
  }, [hydrated, userId, router, fetchOrders, from, to])

  function applyQuickRange(months: number) {
    const d = new Date()
    d.setMonth(d.getMonth() - months)
    setFrom(toDateString(d))
    setTo(today)
  }

  const filtered = useMemo(() => {
    let result = showCancelled ? orders : orders.filter((o) => o.status !== 'cancelled')
    const q = keyword.trim().toLowerCase()
    if (!q) return result
    return result.filter((order) =>
      order.order_number.toLowerCase().includes(q) ||
      order.order_items?.some((item) => item.product_name.toLowerCase().includes(q))
    )
  }, [orders, keyword, showCancelled])

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/mypage" className="text-xs text-ink-muted hover:text-ink mb-8 inline-block tracking-widest uppercase">
        ← 마이페이지
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-widest text-ink-muted uppercase mb-1">Order History</p>
        <h1 className="text-xl font-semibold text-ink">주문 내역</h1>
      </div>

      {/* 검색 필터 */}
      <div className="border-t border-b border-line py-4 mb-6 flex flex-col gap-3">
        {/* 키워드 */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="주문번호 또는 상품명 검색"
            className="w-full border border-line pl-9 pr-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-ink"
          />
        </div>

        {/* 날짜 */}
        <div className="flex items-center gap-2 flex-wrap">
          {QUICK_RANGES.map(({ label, months }) => (
            <button
              key={label}
              onClick={() => applyQuickRange(months)}
              className="text-xs border border-line px-3 py-1.5 text-ink-muted hover:border-ink hover:text-ink transition"
            >
              {label}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-line px-3 py-1.5 text-sm text-ink bg-white focus:outline-none focus:border-ink"
            />
            <span className="text-ink-muted text-sm">–</span>
            <input
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={(e) => setTo(e.target.value)}
              className="border border-line px-3 py-1.5 text-sm text-ink bg-white focus:outline-none focus:border-ink"
            />
          </div>
        </div>
      </div>

      {/* 결과 카운트 + 취소 주문 토글 */}
      {!loading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-ink-muted">{filtered.length}건</p>
          <button
            onClick={() => setShowCancelled((v) => !v)}
            className={`text-xs px-3 py-1.5 border transition ${showCancelled ? 'border-ink text-ink' : 'border-line text-ink-muted hover:border-ink hover:text-ink'}`}
          >
            {showCancelled ? '취소 주문 숨기기' : '취소 주문 포함'}
          </button>
        </div>
      )}

      {/* 결과 */}
      {loading ? (
        <p className="text-sm text-ink-muted text-center py-16">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-16">검색 결과가 없습니다.</p>
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {filtered.map((order) => (
            <div key={order.id} className="py-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[order.status] ?? 'bg-surface-muted text-ink-sub'}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {new Date(order.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <Link href={`/mypage/orders/${order.id}`} className="text-[11px] text-ink-muted hover:text-ink transition">
                  #{order.order_number} →
                </Link>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="text-sm text-ink">
                    {item.product_name}
                    {(item.option_color || item.option_size) && (
                      <span className="text-ink-muted text-xs ml-1.5">
                        {[item.option_color, item.option_size].filter(Boolean).join(' / ')}
                      </span>
                    )}
                    <span className="text-ink-muted text-xs ml-1.5">×{item.quantity}</span>
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
    </div>
  )
}
