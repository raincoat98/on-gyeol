import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { apiFetch, apiFetchOrNull } from '@/lib/api/server'
import ProductCard from '@/components/shop/ProductCard'
import type { Category, ProductWithImages } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await apiFetchOrNull<Category>(`/categories/slug/${slug}`)

  if (!category) return {}
  return {
    title: `${category.name} | 온결`,
    description: `온결 ${category.name} - 편안하고 따뜻한 데일리룩`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (slug === 'all') {
    let products: ProductWithImages[]
    try {
      products = await apiFetch<ProductWithImages[]>('/products?status=active&limit=200')
    } catch {
      products = []
    }

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-brand text-2xl font-bold text-ink mb-6">전체</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    )
  }

  const category = await apiFetchOrNull<Category>(`/categories/slug/${slug}`)

  if (!category) notFound()

  let products: ProductWithImages[]
  try {
    products = await apiFetch<ProductWithImages[]>(
      `/products?status=active&categoryId=${category.id}&limit=200`,
    )
  } catch {
    products = []
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-brand text-2xl font-bold text-ink mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-sm text-ink-muted mb-6">{category.description}</p>
      )}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-center text-ink-muted py-24">해당 카테고리의 상품을 준비 중입니다.</p>
      )}
    </div>
  )
}
