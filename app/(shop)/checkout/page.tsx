'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import { useCartStore } from '@/lib/store/cart'

const DELIVERY_FEE = 3000
const FREE_DELIVERY_THRESHOLD = 50000
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCartStore()
  const [hydrated, setHydrated] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setHydrated(true), [])

  if (!hydrated) return null

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-[#9C9189] mb-4">장바구니가 비어있습니다.</p>
        <Link href="/products" className="text-[#5C4A2A] underline">
          쇼핑 계속하기
        </Link>
      </div>
    )
  }

  const subtotal = totalAmount()
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('이름, 연락처, 주소를 모두 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      // 주문 생성 (pending 상태)
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          customerMemo: memo,
          totalAmount: total,
          deliveryFee,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            productSlug: i.productSlug,
            imageUrl: i.imageUrl,
            optionColor: i.color,
            optionSize: i.size,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '주문 생성에 실패했습니다.')
      }

      const { orderId, orderNumber } = await res.json()

      // 토스페이먼츠 결제 요청
      const tossPayments = await loadTossPayments(CLIENT_KEY)
      const payment = tossPayments.payment({ customerKey: ANONYMOUS })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: total },
        orderId,
        orderName:
          items.length === 1
            ? items[0].productName
            : `${items[0].productName} 외 ${items.length - 1}건`,
        successUrl: `${window.location.origin}/order/complete?orderNumber=${orderNumber}`,
        failUrl: `${window.location.origin}/checkout?error=payment_failed`,
        customerName: name,
        customerMobilePhone: phone.replace(/-/g, ''),
      })

      clearCart()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.'
      // 사용자가 결제 취소 시 Toss가 에러를 던지지만 페이지는 유지
      if (!msg.includes('PAY_PROCESS_CANCELED')) {
        setError(msg)
      }
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-8">주문 / 결제</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* 주문 상품 */}
        <section>
          <h2 className="text-base font-semibold text-[#5C4A2A] mb-4">주문 상품</h2>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.color}-${item.size}`}
                className="flex gap-3 items-center bg-[#F3EDE4] rounded-xl p-3"
              >
                <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-[#E8DFD0] flex-shrink-0">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2D2416] truncate">{item.productName}</p>
                  <p className="text-xs text-[#9C9189]">
                    {[item.color, item.size].filter(Boolean).join(' / ')} · {item.quantity}개
                  </p>
                </div>
                <span className="text-sm font-bold text-[#5C4A2A] flex-shrink-0">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 배송 정보 */}
        <section>
          <h2 className="text-base font-semibold text-[#5C4A2A] mb-4">배송 정보</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm text-[#8B6F47] mb-1 block">받는 분 이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-sm text-[#2D2416] focus:outline-none focus:border-[#8B6F47] bg-white"
              />
            </div>
            <div>
              <label className="text-sm text-[#8B6F47] mb-1 block">연락처 *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-sm text-[#2D2416] focus:outline-none focus:border-[#8B6F47] bg-white"
              />
            </div>
            <div>
              <label className="text-sm text-[#8B6F47] mb-1 block">배송 주소 *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="서울시 강남구 테헤란로 123 (우편번호 포함)"
                className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-sm text-[#2D2416] focus:outline-none focus:border-[#8B6F47] bg-white"
              />
            </div>
            <div>
              <label className="text-sm text-[#8B6F47] mb-1 block">배송 메모</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="문 앞에 놓아주세요"
                className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-sm text-[#2D2416] focus:outline-none focus:border-[#8B6F47] bg-white"
              />
            </div>
          </div>
        </section>

        {/* 결제 금액 */}
        <section className="bg-[#F3EDE4] rounded-xl p-5 flex flex-col gap-2 text-sm text-[#8B6F47]">
          <div className="flex justify-between">
            <span>상품 금액</span>
            <span>{subtotal.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송비</span>
            <span>{deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}</span>
          </div>
          <div className="border-t border-[#E8DFD0] pt-2 mt-1 flex justify-between font-bold text-base text-[#2D2416]">
            <span>총 결제금액</span>
            <span>{total.toLocaleString()}원</span>
          </div>
        </section>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5C4A2A] text-white font-bold py-4 rounded-xl text-base hover:bg-[#8B6F47] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : `${total.toLocaleString()}원 결제하기`}
        </button>
      </form>
    </div>
  )
}
