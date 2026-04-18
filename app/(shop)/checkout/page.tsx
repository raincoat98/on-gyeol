'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/store/cart'
import type { CartItem } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import type { Address } from '@/types'

const DELIVERY_FEE = 3000
const FREE_DELIVERY_THRESHOLD = 50000
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isBuyNow = searchParams.get('mode') === 'buynow'
  const { items: cartItems, clearCart, buyNowItem, clearBuyNow } = useCartStore()
  const items: CartItem[] = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems

  const userId = useAuthStore((s) => s.userId)
  const hydrated = useAuthStore((s) => s.hydrated)
  const [addresses, setAddresses] = useState<Address[]>([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')
  const [saveAddress, setSaveAddress] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
      .then(({ data: addrs }) => {
        const list = addrs ?? []
        setAddresses(list)
        // 기본 배송지 자동 입력
        const def = list.find((a) => a.is_default) ?? list[0]
        if (def) {
          setName(def.recipient_name)
          setPhone(def.phone)
          setAddress(def.address)
        }
      })
  }, [userId])

  if (!hydrated) return null

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-muted mb-4">장바구니가 비어있습니다.</p>
        <Link href="/products" className="text-ink underline">쇼핑 계속하기</Link>
      </div>
    )
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  function fillAddress(addr: Address) {
    setName(addr.recipient_name)
    setPhone(addr.phone)
    setAddress(addr.address)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('이름, 연락처, 주소를 모두 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      // 배송지 저장 (로그인 + 체크한 경우, 동일 주소 미존재 시)
      if (userId && saveAddress) {
        const supabase = createClient()
        const duplicate = addresses.some(
          (a) => a.recipient_name === name && a.phone === phone && a.address === address
        )
        if (!duplicate) {
          await supabase.from('addresses').insert({
            user_id: userId,
            label: '최근 배송지',
            recipient_name: name,
            phone,
            address,
            is_default: addresses.length === 0,
          })
        }
      }

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
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

      if (isBuyNow) clearBuyNow()
      else clearCart()
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ''
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.'
      const isCanceled = code === 'PAY_PROCESS_CANCELED' || msg.includes('PAY_PROCESS_CANCELED')
      if (isCanceled) {
        const def = addresses.find((a) => a.is_default) ?? addresses[0]
        setName(def?.recipient_name ?? '')
        setPhone(def?.phone ?? '')
        setAddress(def?.address ?? '')
        setMemo('')
        setSaveAddress(false)
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-brand text-2xl font-bold text-ink mb-8">주문 / 결제</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* 주문 상품 */}
        <section>
          <h2 className="text-base font-semibold text-ink mb-4">주문 상품</h2>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.color}-${item.size}`}
                className="flex gap-3 items-center bg-white border border-line rounded-xl p-3"
              >
                <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-line flex-shrink-0">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{item.productName}</p>
                  <p className="text-xs text-ink-muted">
                    {[item.color, item.size].filter(Boolean).join(' / ')} · {item.quantity}개
                  </p>
                </div>
                <span className="text-sm font-bold text-ink flex-shrink-0">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 저장된 배송지 선택 (로그인 시) */}
        {addresses.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-ink mb-3">저장된 배송지</h2>
            <div className="flex flex-col gap-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => fillAddress(addr)}
                  className={`text-left border rounded-xl p-3 transition ${
                    name === addr.recipient_name && phone === addr.phone && address === addr.address
                      ? 'border-ink bg-surface'
                      : 'border-line hover:border-ink-sub'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-ink-sub bg-surface-muted px-2 py-0.5 rounded-full">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-xs font-semibold text-white bg-surface-dark px-2 py-0.5 rounded-full">
                        기본
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-ink">{addr.recipient_name} · {addr.phone}</p>
                  <p className="text-xs text-ink-muted">{addr.address}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 배송 정보 입력 */}
        <section>
          <h2 className="text-base font-semibold text-ink mb-4">배송 정보</h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="받는 분 이름 *"
              className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink bg-white"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="연락처 *"
              className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink bg-white"
            />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="배송 주소 (우편번호 포함) *"
              className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink bg-white"
            />
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="배송 메모 (선택)"
              className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink bg-white"
            />
            {userId && (
              <label className="flex items-center gap-2 text-sm text-ink-sub cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="rounded"
                />
                이 배송지를 저장하기
              </label>
            )}
            {!userId && (
              <p className="text-xs text-ink-muted">
                <Link href="/auth/login?next=/checkout" className="text-ink underline">로그인</Link>하면 배송지를 저장할 수 있습니다.
              </p>
            )}
          </div>
        </section>

        {/* 결제 금액 */}
        <section className="bg-white border border-line rounded-xl p-5 flex flex-col gap-2 text-sm text-ink-sub">
          <div className="flex justify-between">
            <span>상품 금액</span>
            <span>{subtotal.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송비</span>
            <span>{deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}</span>
          </div>
          <div className="border-t border-line pt-2 mt-1 flex justify-between font-bold text-base text-ink">
            <span>총 결제금액</span>
            <span>{total.toLocaleString()}원</span>
          </div>
        </section>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-surface-dark text-white font-bold py-4 rounded-xl text-base hover:bg-surface-hover transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : `${total.toLocaleString()}원 결제하기`}
        </button>
      </form>
    </div>
  )
}
