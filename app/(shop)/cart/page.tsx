'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

const DELIVERY_FEE = 3000
const FREE_DELIVERY_THRESHOLD = 50000

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount } = useCartStore()
  // Wait for Zustand hydration
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  if (!hydrated) return null

  const subtotal = totalAmount()
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-line mb-4" />
        <p className="text-ink-muted text-lg mb-6">장바구니가 비어있습니다.</p>
        <Link
          href="/products"
          className="inline-block bg-surface-dark text-white font-semibold px-8 py-3 rounded-full hover:bg-surface-hover transition"
        >
          쇼핑 계속하기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-brand text-2xl font-bold text-ink mb-8">장바구니</h1>

      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => {
          const key = `${item.productId}-${item.color}-${item.size}`
          return (
            <div key={key} className="flex gap-4 bg-white border border-line rounded-xl p-4">
              {/* 이미지 */}
              <Link href={`/products/${item.productSlug}`} className="flex-shrink-0">
                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-line">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
              </Link>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productSlug}`}>
                  <p className="font-medium text-ink text-sm leading-snug mb-1 hover:text-ink">
                    {item.productName}
                  </p>
                </Link>
                <p className="text-xs text-ink-muted mb-3">
                  {[item.color, item.size].filter(Boolean).join(' / ')}
                </p>

                <div className="flex items-center justify-between">
                  {/* 수량 */}
                  <div className="flex items-center gap-2 border border-line rounded-full px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                      className="text-ink hover:text-ink-sub"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium text-ink w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                      className="text-ink hover:text-ink-sub"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                    <button
                      onClick={() => removeItem(item.productId, item.color, item.size)}
                      className="text-ink-faint hover:text-red-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 금액 요약 */}
      <div className="bg-white border border-line rounded-xl p-5 mb-6 flex flex-col gap-2 text-sm text-ink-sub">
        <div className="flex justify-between">
          <span>상품 금액</span>
          <span>{subtotal.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between">
          <span>배송비</span>
          <span>{deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}</span>
        </div>
        {subtotal < FREE_DELIVERY_THRESHOLD && (
          <p className="text-xs text-ink-muted">
            {(FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString()}원 더 담으면 무료배송
          </p>
        )}
        <div className="border-t border-line pt-2 mt-1 flex justify-between font-bold text-base text-ink">
          <span>총 결제금액</span>
          <span>{total.toLocaleString()}원</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full bg-surface-dark text-white font-bold py-4 rounded-xl text-center text-base hover:bg-surface-hover transition"
      >
        주문하기
      </Link>
    </div>
  )
}
