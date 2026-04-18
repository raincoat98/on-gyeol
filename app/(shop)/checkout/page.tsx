'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, X } from 'lucide-react'
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

type ShippingInfo = {
  name: string
  phone: string
  address: string
  savedAddressId?: string
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const isBuyNow = searchParams.get('mode') === 'buynow'
  const { items: cartItems, clearCart, buyNowItem, clearBuyNow } = useCartStore()
  const items: CartItem[] = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems

  const userId = useAuthStore((s) => s.userId)
  const hydrated = useAuthStore((s) => s.hydrated)
  const [addresses, setAddresses] = useState<Address[]>([])

  const [shipping, setShipping] = useState<ShippingInfo>({ name: '', phone: '', address: '' })
  const [memo, setMemo] = useState('')

  // 주소 모달
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPhone, setCustomPhone] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [saveCustom, setSaveCustom] = useState(false)

  // 메모 편집
  const [editingMemo, setEditingMemo] = useState(false)
  const [memoInput, setMemoInput] = useState('')

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
        const def = list.find((a) => a.is_default) ?? list[0]
        if (def) {
          setShipping({ name: def.recipient_name, phone: def.phone, address: def.address, savedAddressId: def.id })
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

  function openAddressModal() {
    setCustomMode(false)
    setCustomName(shipping.name)
    setCustomPhone(shipping.phone)
    setCustomAddress(shipping.address)
    setSaveCustom(false)
    setShowAddressModal(true)
  }

  function selectSavedAddress(addr: Address) {
    setShipping({ name: addr.recipient_name, phone: addr.phone, address: addr.address, savedAddressId: addr.id })
    setShowAddressModal(false)
  }

  function confirmCustomAddress() {
    if (!customName.trim() || !customPhone.trim() || !customAddress.trim()) return
    setShipping({ name: customName, phone: customPhone, address: customAddress })
    setShowAddressModal(false)
  }

  function openMemoEdit() {
    setMemoInput(memo)
    setEditingMemo(true)
  }

  function saveMemo() {
    setMemo(memoInput)
    setEditingMemo(false)
  }

  async function handleSubmit() {
    setError('')
    if (!shipping.name.trim() || !shipping.phone.trim() || !shipping.address.trim()) {
      setError('배송지를 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      if (userId && saveCustom && !shipping.savedAddressId) {
        const supabase = createClient()
        const duplicate = addresses.some(
          (a) => a.recipient_name === shipping.name && a.phone === shipping.phone && a.address === shipping.address
        )
        if (!duplicate) {
          await supabase.from('addresses').insert({
            user_id: userId,
            label: '최근 배송지',
            recipient_name: shipping.name,
            phone: shipping.phone,
            address: shipping.address,
            is_default: addresses.length === 0,
          })
        }
      }

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          customerName: shipping.name,
          customerPhone: shipping.phone,
          customerAddress: shipping.address,
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
        customerName: shipping.name,
        customerMobilePhone: shipping.phone.replace(/-/g, ''),
      })

      if (isBuyNow) clearBuyNow()
      else clearCart()
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ''
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.'
      const isCanceled = code === 'PAY_PROCESS_CANCELED' || msg.includes('PAY_PROCESS_CANCELED')
      if (isCanceled) {
        const def = addresses.find((a) => a.is_default) ?? addresses[0]
        if (def) {
          setShipping({ name: def.recipient_name, phone: def.phone, address: def.address, savedAddressId: def.id })
        } else {
          setShipping({ name: '', phone: '', address: '' })
        }
        setMemo('')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  const selectedAddr = addresses.find((a) => a.id === shipping.savedAddressId)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-brand text-2xl font-bold text-ink mb-8">주문 / 결제</h1>

      <div className="flex flex-col gap-4">
        {/* 주문 상품 */}
        <section className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="text-sm font-semibold text-ink">주문 상품</h2>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.color}-${item.size}`}
                className="flex gap-3 items-center px-5 py-4"
              >
                <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-surface shrink-0">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="48px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{item.productName}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {[item.color, item.size].filter(Boolean).join(' / ')} · {item.quantity}개
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink shrink-0 shrink-0">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 배송지 */}
        <section className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">배송지</h2>
              {shipping.name && (
                <span className="text-sm text-ink-muted">| {shipping.name}</span>
              )}
            </div>
            <button
              type="button"
              onClick={openAddressModal}
              className="flex items-center gap-1 text-xs text-ink border border-line px-3 py-1.5 rounded-full hover:border-ink transition"
            >
              배송지 변경
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="px-5 py-4">
            {shipping.address ? (
              <div className="flex flex-col gap-1">
                {selectedAddr && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs text-ink-sub bg-surface-muted px-2 py-0.5 rounded-full">
                      {selectedAddr.label}
                    </span>
                    {selectedAddr.is_default && (
                      <span className="text-xs text-white bg-surface-dark px-2 py-0.5 rounded-full">
                        기본배송지
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-ink">{shipping.address}</p>
                <p className="text-sm text-ink-muted">휴대폰 : {shipping.phone}</p>
                {userId && !shipping.savedAddressId && (
                  <label className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={saveCustom}
                      onChange={(e) => setSaveCustom(e.target.checked)}
                      className="rounded"
                    />
                    이 배송지를 저장하기
                  </label>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAddressModal}
                className="text-sm text-ink-muted hover:text-ink transition"
              >
                + 배송지를 추가해주세요
              </button>
            )}
          </div>
        </section>

        {/* 배송 요청사항 */}
        <section className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="text-sm font-semibold text-ink">배송 요청사항</h2>
            <button
              type="button"
              onClick={openMemoEdit}
              className="text-xs text-ink border border-line px-3 py-1.5 rounded-full hover:border-ink transition"
            >
              변경
            </button>
          </div>
          <div className="px-5 py-4">
            {editingMemo ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={memoInput}
                  onChange={(e) => setMemoInput(e.target.value)}
                  placeholder="예: 문 앞에 놓아주세요"
                  className="flex-1 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveMemo()}
                />
                <button
                  type="button"
                  onClick={saveMemo}
                  className="text-xs bg-surface-dark text-white px-4 py-2 rounded-lg"
                >
                  확인
                </button>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">{memo || '없음'}</p>
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
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-surface-dark text-white font-bold py-4 rounded-xl text-base hover:bg-surface-hover transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : `${total.toLocaleString()}원 결제하기`}
        </button>
      </div>

      {/* 배송지 선택 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h3 className="font-semibold text-ink">배송지 선택</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-ink-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {/* 저장된 배송지 */}
              {addresses.map((addr) => {
                const isSelected = addr.id === shipping.savedAddressId
                return (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr)}
                    className={`text-left border rounded-xl p-4 transition w-full ${
                      isSelected ? 'border-ink bg-surface' : 'border-line hover:border-ink-sub'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs text-ink-sub bg-surface-muted px-2 py-0.5 rounded-full">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span className="text-xs text-white bg-surface-dark px-2 py-0.5 rounded-full">
                          기본
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-ink">{addr.recipient_name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{addr.phone}</p>
                    <p className="text-xs text-ink-muted">{addr.address}</p>
                  </button>
                )
              })}

              {/* 직접 입력 */}
              {!customMode ? (
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className="w-full border border-dashed border-line rounded-xl p-4 text-sm text-ink-muted hover:border-ink-sub hover:text-ink transition"
                >
                  + 새 배송지 직접 입력
                </button>
              ) : (
                <div className="border border-line rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-sm font-medium text-ink">새 배송지 입력</p>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="받는 분 이름 *"
                    className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
                  />
                  <input
                    type="tel"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    placeholder="연락처 *"
                    className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
                  />
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="주소 (우편번호 포함) *"
                    className="w-full border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomMode(false)}
                      className="flex-1 border border-line rounded-lg py-2.5 text-sm text-ink-sub hover:bg-surface transition"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={confirmCustomAddress}
                      className="flex-1 bg-surface-dark text-white rounded-lg py-2.5 text-sm font-medium hover:bg-surface-hover transition"
                    >
                      이 주소로 배송
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!customMode && (
              <div className="p-4 border-t border-line">
                <Link
                  href="/mypage/addresses"
                  className="block text-center text-xs text-ink-muted hover:text-ink transition"
                >
                  배송지 관리 →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
