import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import type { ProductWithImages } from '@/types'

export const metadata: Metadata = { title: '검색' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  let products: ProductWithImages[] = []

  if (q && q.trim()) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, product_images(*), categories(*)')
      .eq('status', 'active')
      .ilike('name', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(40)
    products = (data ?? []) as ProductWithImages[]
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <form method="GET" action="/search" className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="상품명을 검색하세요"
            className="flex-1 border border-[#E8DFD0] rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-[#8B6F47]"
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#5C4A2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#8B6F47] transition"
          >
            검색
          </button>
        </div>
      </form>

      {q ? (
        <>
          <p className="text-sm text-[#9C9189] mb-6">
            &ldquo;{q}&rdquo; 검색 결과 {products.length}건
          </p>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-center text-[#9C9189] py-16">검색 결과가 없습니다.</p>
          )}
        </>
      ) : (
        <p className="text-center text-[#9C9189] py-16">찾고 싶은 상품을 검색해 보세요.</p>
      )}
    </div>
  )
}
