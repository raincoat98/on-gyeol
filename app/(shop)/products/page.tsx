import type { Metadata } from 'next'
import { apiFetch } from '@/lib/api/server'
import ProductCard from '@/components/shop/ProductCard'
import type { ProductWithImages } from '@/types'

export const metadata: Metadata = {
  title: '전체 상품',
  description: '온결의 모든 상품을 만나보세요.',
}

interface SearchParams {
  sort?: string
  filter?: string
  category?: string
}

async function getProducts(searchParams: SearchParams): Promise<ProductWithImages[]> {
  const query = new URLSearchParams({ status: 'active', limit: '60' })

  if (searchParams.filter === 'featured') query.set('featured', 'true')
  if (searchParams.category) query.set('categorySlug', searchParams.category)

  if (searchParams.sort === 'price_asc') {
    query.set('sort', 'price.asc')
  } else if (searchParams.sort === 'price_desc') {
    query.set('sort', 'price.desc')
  } else {
    query.set('sort', 'created_at.desc')
  }

  try {
    return await apiFetch<ProductWithImages[]>(`/products?${query.toString()}`)
  } catch {
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const products = await getProducts(params)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-brand text-2xl font-bold text-ink">전체 상품</h1>
        <div className="flex gap-2 text-sm">
          <a href="?sort=newest" className={`px-3 py-1 rounded-full border ${!params.sort || params.sort === 'newest' ? 'bg-surface-dark text-white border-ink' : 'border-line text-ink-muted'}`}>
            최신순
          </a>
          <a href="?sort=price_asc" className={`px-3 py-1 rounded-full border ${params.sort === 'price_asc' ? 'bg-surface-dark text-white border-ink' : 'border-line text-ink-muted'}`}>
            낮은가격
          </a>
          <a href="?sort=price_desc" className={`px-3 py-1 rounded-full border ${params.sort === 'price_desc' ? 'bg-surface-dark text-white border-ink' : 'border-line text-ink-muted'}`}>
            높은가격
          </a>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-ink-muted">
          <p className="text-lg mb-2">상품을 준비 중입니다</p>
          <p className="text-sm">곧 다양한 상품으로 찾아올게요.</p>
        </div>
      )}
    </div>
  )
}
