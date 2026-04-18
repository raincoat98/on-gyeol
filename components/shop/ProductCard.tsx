import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithImages } from '@/types'

interface ProductCardProps {
  product: ProductWithImages
}

export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.product_images?.find((img) => img.is_main) ?? product.product_images?.[0]
  const isSoldOut = product.status === 'soldout'
  const hasDiscount = product.sale_price && product.sale_price < product.price
  const discountRate = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-[#E5E5EA] rounded-lg overflow-hidden mb-3">
        {mainImage ? (
          <Image
            src={mainImage.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9C9189] text-sm">
            이미지 없음
          </div>
        )}

        {/* 뱃지 */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isSoldOut && (
            <span className="bg-[#9C9189] text-white text-xs font-semibold px-2 py-1 rounded">
              품절
            </span>
          )}
          {product.is_featured && !isSoldOut && (
            <span className="bg-[#1C1C1E] text-white text-xs font-semibold px-2 py-1 rounded">
              신상품
            </span>
          )}
          {hasDiscount && !isSoldOut && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              {discountRate}%
            </span>
          )}
        </div>
      </div>

      <div className="px-1">
        <p className="text-sm text-[#9C9189] mb-1">{product.categories?.name}</p>
        <p className="font-medium text-[#2D2416] leading-snug mb-1 line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="font-bold text-[#5C4A2A]">
                {product.sale_price!.toLocaleString()}원
              </span>
              <span className="text-sm text-[#9C9189] line-through">
                {product.price.toLocaleString()}원
              </span>
            </>
          ) : (
            <span className="font-bold text-[#2D2416]">
              {product.price.toLocaleString()}원
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
