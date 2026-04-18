import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
      <section className="relative -mt-16 h-[calc(70vh+4rem)] min-h-[480px] flex items-center justify-center overflow-hidden bg-line">
        <Image
          src="/hero.jpg"
          alt="온결 히어로 이미지"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-black/45" />

        {/* 텍스트 */}
        <div className="relative z-10 text-center px-4">
          <p className="text-xs text-white/70 tracking-[0.4em] mb-4 uppercase">Ongyeol</p>
          <h1 className="font-brand text-5xl md:text-7xl font-bold text-white mb-5 tracking-widest">
            온결
          </h1>
          <div className="w-12 h-px bg-white/50 mx-auto mb-5" />
          <p className="text-base md:text-lg text-white/85 mb-10 tracking-wide font-light">
            마음의 결을 담은 옷
          </p>
          <Link
            href="/products"
            className="inline-block border border-white text-white text-sm font-medium tracking-widest px-10 py-3.5 hover:bg-white hover:text-ink transition-colors duration-300"
          >
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* 카테고리 바로가기 */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 bg-white border border-line rounded-xl py-5 hover:border-ink-sub hover:bg-surface transition-colors"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-sm font-medium text-ink">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 신상품 */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-brand text-2xl font-bold text-ink">신상품</h2>
          <Link href="/products?sort=newest" className="text-sm text-ink-muted hover:text-ink">
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
          <p className="text-center text-ink-muted py-16">상품을 준비 중입니다.</p>
        )}
      </section>

      {/* 베스트 상품 */}
      {featuredProducts.length > 0 && (
        <section className="bg-surface-muted py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-brand text-2xl font-bold text-ink">베스트</h2>
              <Link href="/products?filter=featured" className="text-sm text-ink-muted hover:text-ink">
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
        <h2 className="font-brand text-2xl font-bold text-ink mb-4">온결의 이야기</h2>
        <p className="text-ink-sub leading-relaxed max-w-lg mx-auto">
          부부가 함께 고른 옷, 부부가 함께 만든 쇼핑몰입니다.<br />
          편안하고 따뜻한 옷을 합리적인 가격에 드리겠습니다.
        </p>
        <Link
          href="/about"
          className="inline-block mt-6 border border-ink-sub text-ink-sub px-6 py-3 rounded-full text-sm font-medium hover:bg-surface-hover hover:text-white transition-colors"
        >
          브랜드 소개
        </Link>
      </section>
    </div>
  )
}
