import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import InquiryForm from '@/components/shop/InquiryForm'
import type { ProductDetail } from '@/types'

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*), product_options(*)')
    .eq('slug', slug)
    .neq('status', 'hidden')
    .single()
  return data as ProductDetail | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}

  const mainImage = product.product_images?.find((img) => img.is_main) ?? product.product_images?.[0]

  return {
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.short_description ?? `${product.name} - 온결`,
    openGraph: {
      images: mainImage ? [mainImage.image_url] : [],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const mainImage = images.find((img) => img.is_main) ?? images[0]
  const isSoldOut = product.status === 'soldout'
  const hasDiscount = product.sale_price && product.sale_price < product.price
  const discountRate = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0

  const colors = [...new Set(product.product_options?.map((o) => o.color).filter(Boolean))]
  const sizes = [...new Set(product.product_options?.map((o) => o.size).filter(Boolean))]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 빵부스러기 */}
      <nav className="text-sm text-[#9C9189] mb-6">
        <span>홈</span> &rsaquo; <span>{product.categories?.name}</span> &rsaquo; <span className="text-[#5C4A2A]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 이미지 */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[3/4] bg-[#E8DFD0] rounded-xl overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#9C9189]">
                이미지 없음
              </div>
            )}
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">품절</span>
              </div>
            )}
          </div>
          {/* 서브 이미지 */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img) => (
                <div key={img.id} className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#E8DFD0]">
                  <Image src={img.image_url} alt="" fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-[#9C9189] mb-1">{product.categories?.name}</p>
            <h1 className="text-2xl font-bold text-[#2D2416] leading-snug mb-3">{product.name}</h1>
            <div className="flex items-center gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-bold text-[#5C4A2A]">
                    {product.sale_price!.toLocaleString()}원
                  </span>
                  <span className="text-base text-[#9C9189] line-through">
                    {product.price.toLocaleString()}원
                  </span>
                  <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded">
                    {discountRate}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-[#2D2416]">
                  {product.price.toLocaleString()}원
                </span>
              )}
            </div>
          </div>

          {/* 색상 */}
          {colors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#5C4A2A] mb-2">색상</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <span key={color!} className="px-3 py-1.5 border border-[#E8DFD0] rounded-full text-sm text-[#5C4A2A]">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 사이즈 */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#5C4A2A] mb-2">사이즈</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <span key={size!} className="px-3 py-1.5 border border-[#E8DFD0] rounded-full text-sm text-[#5C4A2A]">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 짧은 설명 */}
          {product.short_description && (
            <p className="text-sm text-[#8B6F47] leading-relaxed border-l-2 border-[#E8DFD0] pl-3">
              {product.short_description}
            </p>
          )}

          {/* 문의 버튼 */}
          <div className="flex flex-col gap-3 mt-2">
            <a
              href="https://pf.kakao.com/_your_kakao_id"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#FEE500] text-[#3A1D1D] font-bold py-4 rounded-xl text-center text-base hover:opacity-90 transition"
            >
              카카오톡으로 문의하기
            </a>
            <a
              href="tel:01000000000"
              className="w-full bg-[#5C4A2A] text-white font-bold py-4 rounded-xl text-center text-base hover:bg-[#8B6F47] transition"
            >
              전화로 문의하기
            </a>
          </div>

          {/* 배송 안내 */}
          <div className="bg-[#F3EDE4] rounded-xl p-4 text-sm text-[#8B6F47] flex flex-col gap-1.5">
            <p className="font-semibold text-[#5C4A2A] mb-1">배송 안내</p>
            <p>주문 확인 후 1~3 영업일 이내 발송</p>
            <p>배송비 3,000원 (5만원 이상 무료)</p>
          </div>
        </div>
      </div>

      {/* 상세 설명 */}
      {product.description && (
        <div className="mt-14">
          <h2 className="font-brand text-xl font-bold text-[#5C4A2A] mb-6 pb-3 border-b border-[#E8DFD0]">
            상품 상세
          </h2>
          <div
            className="prose max-w-none text-[#2D2416] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* 문의 폼 */}
      <div className="mt-14">
        <h2 className="font-brand text-xl font-bold text-[#5C4A2A] mb-6 pb-3 border-b border-[#E8DFD0]">
          상품 문의
        </h2>
        <InquiryForm productId={product.id} productName={product.name} />
      </div>

      {/* 교환/환불 안내 */}
      <div className="mt-14 bg-[#F3EDE4] rounded-xl p-6 text-sm text-[#8B6F47]">
        <p className="font-semibold text-[#5C4A2A] text-base mb-3">교환 / 환불 안내</p>
        <ul className="flex flex-col gap-1.5 list-disc list-inside">
          <li>수령 후 7일 이내 교환/환불 가능</li>
          <li>착용/세탁 후 교환/환불 불가</li>
          <li>색상 불량, 사이즈 오배송 시 전액 환불</li>
          <li>단순 변심 시 왕복 배송비 고객 부담</li>
        </ul>
      </div>
    </div>
  )
}
