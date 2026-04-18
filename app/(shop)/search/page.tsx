'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/shop/ProductCard'
import type { ProductWithImages } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

    const q = query.trim()
    if (!q) {
      setProducts([])
      setSearched(false)
      return
    }

    setLoading(true)
    timer.current = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .eq('status', 'active')
        .ilike('name', `%${q}%`)
        .order('created_at', { ascending: false })
        .limit(40)
      setProducts((data ?? []) as ProductWithImages[])
      setSearched(true)
      setLoading(false)
    }, 300)
  }, [query])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품명을 검색하세요"
          className="w-full border border-line rounded-xl pl-11 pr-4 py-3.5 text-base bg-white focus:outline-none focus:border-ink"
          autoFocus
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted animate-pulse">
            검색 중...
          </span>
        )}
      </div>

      {searched ? (
        <>
          <p className="text-sm text-ink-muted mb-6">
            &ldquo;{query}&rdquo; 검색 결과 {products.length}건
          </p>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-center text-ink-muted py-16">검색 결과가 없습니다.</p>
          )}
        </>
      ) : (
        <p className="text-center text-ink-muted py-16">찾고 싶은 상품을 검색해 보세요.</p>
      )}
    </div>
  )
}
