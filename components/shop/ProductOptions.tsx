'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, CreditCard } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import type { ProductOption } from '@/types'

type Props = {
  product: {
    id: string
    name: string
    slug: string
    price: number
    sale_price: number | null
    status: string
  }
  imageUrl: string | null
  options: ProductOption[]
}

export default function ProductOptions({ product, imageUrl, options }: Props) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const colors = [...new Set(options.map((o) => o.color).filter(Boolean))] as string[]
  const sizes = [...new Set(options.map((o) => o.size).filter(Boolean))] as string[]

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null)
  const [added, setAdded] = useState(false)

  const isSoldOut = product.status === 'soldout'
  const price = product.sale_price ?? product.price

  const selectedOption = options.find(
    (o) => o.color === selectedColor && o.size === selectedSize
  )
  const outOfStock = selectedOption ? selectedOption.stock_qty <= 0 : false
  const disabled = isSoldOut || outOfStock

  function buildCartItem() {
    return {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl,
      price,
      color: selectedColor,
      size: selectedSize,
    }
  }

  function handleAddToCart() {
    addItem(buildCartItem())
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    addItem(buildCartItem())
    router.push('/checkout')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 색상 */}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[#5C4A2A] mb-2">
            색상 <span className="font-normal text-[#8B6F47]">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-3 py-1.5 border rounded-full text-sm transition-colors ${
                  selectedColor === color
                    ? 'border-[#5C4A2A] bg-[#5C4A2A] text-white'
                    : 'border-[#E8DFD0] text-[#5C4A2A] hover:border-[#8B6F47]'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 사이즈 */}
      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[#5C4A2A] mb-2">
            사이즈 <span className="font-normal text-[#8B6F47]">{selectedSize}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const opt = options.find((o) => o.color === selectedColor && o.size === size)
              const soldOut = opt ? opt.stock_qty <= 0 : false
              return (
                <button
                  key={size}
                  onClick={() => !soldOut && setSelectedSize(size)}
                  disabled={soldOut}
                  className={`px-3 py-1.5 border rounded-full text-sm transition-colors ${
                    soldOut
                      ? 'border-[#E8DFD0] text-[#C5BDB5] line-through cursor-not-allowed'
                      : selectedSize === size
                      ? 'border-[#5C4A2A] bg-[#5C4A2A] text-white'
                      : 'border-[#E8DFD0] text-[#5C4A2A] hover:border-[#8B6F47]'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 구매 버튼 */}
      <div className="flex flex-col gap-3 mt-2">
        {isSoldOut ? (
          <div className="w-full bg-[#E8DFD0] text-[#9C9189] font-bold py-4 rounded-xl text-center text-base">
            품절된 상품입니다
          </div>
        ) : (
          <>
            <button
              onClick={handleBuyNow}
              disabled={disabled}
              className="w-full bg-[#5C4A2A] text-white font-bold py-4 rounded-xl text-base hover:bg-[#8B6F47] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              바로 구매하기
            </button>
            <button
              onClick={handleAddToCart}
              disabled={disabled}
              className="w-full bg-white border-2 border-[#5C4A2A] text-[#5C4A2A] font-bold py-4 rounded-xl text-base hover:bg-[#FAF8F4] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              {added ? '담겼습니다!' : '장바구니 담기'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
