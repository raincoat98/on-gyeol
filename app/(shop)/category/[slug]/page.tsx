import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import type { ProductWithImages } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select()
    .eq('slug', slug)
    .single()

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
    const supabase = await createClient()
    const { data: products } = await supabase
      .from('products')
      .select('*, product_images(*), categories(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-6">전체</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(products as ProductWithImages[] ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select()
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*)')
    .eq('status', 'active')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-sm text-[#9C9189] mb-6">{category.description}</p>
      )}
      {(products as ProductWithImages[] ?? []).length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(products as ProductWithImages[]).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-center text-[#9C9189] py-24">해당 카테고리의 상품을 준비 중입니다.</p>
      )}
    </div>
  )
}
