'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/shop/ProductCard'
import type { ProductWithImages } from '@/types'

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(!!initialQuery)
  const [searched, setSearched] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

    const q = query.trim()

    if (q) {
      router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false })
    } else {
      router.replace('/search', { scroll: false })
      setProducts([])
      setSearched(false)
      setLoading(false)
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

  function clearQuery() {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 검색 입력 */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품명을 검색하세요"
          className="w-full border border-line rounded-xl pl-11 pr-10 py-3.5 text-base bg-white focus:outline-none focus:border-ink transition"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition"
            aria-label="검색어 지우기"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 스켈레톤 */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-[3/4] bg-line rounded-lg animate-pulse" />
              <div className="px-1 flex flex-col gap-1.5">
                <div className="h-3 w-1/2 bg-line rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-line rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-line rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 검색 결과 */}
      {!loading && searched && (
        <>
          <p className="text-sm text-ink-muted mb-6">
            &ldquo;{query.trim()}&rdquo; 검색 결과 {products.length}건
          </p>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-24 gap-3 text-center">
              <Search size={36} className="text-line" strokeWidth={1.5} />
              <p className="font-medium text-ink">검색 결과가 없습니다</p>
              <p className="text-sm text-ink-muted">
                &ldquo;{query.trim()}&rdquo;와 일치하는 상품이 없어요
              </p>
            </div>
          )}
        </>
      )}

      {/* 초기 상태 */}
      {!loading && !searched && (
        <div className="flex flex-col items-center py-24 gap-3 text-center">
          <Search size={36} className="text-line" strokeWidth={1.5} />
          <p className="text-ink-muted">찾고 싶은 상품을 검색해 보세요</p>
        </div>
      )}
    </div>
  )
}
