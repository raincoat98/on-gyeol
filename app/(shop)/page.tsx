import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import type { ProductWithImages } from '@/types'

export const metadata: Metadata = {
  title: '온결 | 따뜻하고 편안한 데일리룩',
  description: '마음의 결을 담은 옷, 온결. 부부의 안목으로 고른 3060 여성 데일리룩.',
}

async function getFeaturedProducts(): Promise<ProductWithImages[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*)')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8)
  return (data ?? []) as ProductWithImages[]
}

async function getNewProducts(): Promise<ProductWithImages[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)
  return (data ?? []) as ProductWithImages[]
}

const CATEGORIES = [
  { name: '상의', slug: 'tops', emoji: '👚' },
  { name: '하의', slug: 'bottoms', emoji: '👖' },
  { name: '원피스', slug: 'onepiece', emoji: '👗' },
  { name: '아우터', slug: 'outer', emoji: '🧥' },
]

export default async function HomePage() {
  const [featuredProducts, newProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ])

  return (
    <div>
      {/* 히어로 배너 */}
      <section className="bg-[#E8DFD0] py-16 px-4 text-center">
        <p className="text-sm text-[#9C9189] mb-2 tracking-widest">ONGYEOL</p>
        <h1 className="font-brand text-4xl md:text-5xl font-bold text-[#5C4A2A] mb-4">
          온결
        </h1>
        <p className="text-lg text-[#8B6F47] mb-8">마음의 결을 담은 옷</p>
        <Link
          href="/products"
          className="inline-block bg-[#5C4A2A] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#8B6F47] transition-colors"
        >
          전체 상품 보기
        </Link>
      </section>

      {/* 카테고리 바로가기 */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 bg-white border border-[#E8DFD0] rounded-xl py-5 hover:border-[#8B6F47] hover:bg-[#FAF8F4] transition-colors"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-sm font-medium text-[#5C4A2A]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 신상품 */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-brand text-2xl font-bold text-[#5C4A2A]">신상품</h2>
          <Link href="/products?sort=newest" className="text-sm text-[#9C9189] hover:text-[#5C4A2A]">
            더보기 →
          </Link>
        </div>
        {newProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[#9C9189] py-16">상품을 준비 중입니다.</p>
        )}
      </section>

      {/* 베스트 상품 */}
      {featuredProducts.length > 0 && (
        <section className="bg-[#F3EDE4] py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-brand text-2xl font-bold text-[#5C4A2A]">베스트</h2>
              <Link href="/products?filter=featured" className="text-sm text-[#9C9189] hover:text-[#5C4A2A]">
                더보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 브랜드 소개 */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-4">온결의 이야기</h2>
        <p className="text-[#8B6F47] leading-relaxed max-w-lg mx-auto">
          부부가 함께 고른 옷, 부부가 함께 만든 쇼핑몰입니다.<br />
          편안하고 따뜻한 옷을 합리적인 가격에 드리겠습니다.
        </p>
        <Link
          href="/about"
          className="inline-block mt-6 border border-[#8B6F47] text-[#8B6F47] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#8B6F47] hover:text-white transition-colors"
        >
          브랜드 소개
        </Link>
      </section>
    </div>
  )
}
