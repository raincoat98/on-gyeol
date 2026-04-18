import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProductStatusToggle from '@/components/admin/ProductStatusToggle'
import type { ProductWithImages } from '@/types'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, product_images(*), categories(*)')
    .order('created_at', { ascending: false })

  if (params.filter === 'soldout') {
    query = query.eq('status', 'soldout')
  } else if (params.filter === 'hidden') {
    query = query.eq('status', 'hidden')
  }

  const { data: products } = await query.limit(100)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-ink tracking-tight">상품 관리</h1>
        <Link
          href="/admin/products/new"
          className="bg-surface-dark text-white font-medium px-5 py-2.5 rounded-xl hover:bg-surface-hover transition text-sm"
        >
          + 새 상품 등록
        </Link>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        {[
          { label: '전체', value: '' },
          { label: '품절', value: 'soldout' },
          { label: '숨김', value: 'hidden' },
        ].map((f) => (
          <a
            key={f.value}
            href={f.value ? `?filter=${f.value}` : '/admin/products'}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              (params.filter ?? '') === f.value
                ? 'bg-surface-dark text-white border-ink'
                : 'border-line text-ink-muted hover:border-ink hover:text-ink'
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {products && products.length > 0 ? (
        <div className="flex flex-col gap-2">
          {(products as ProductWithImages[]).map((product) => {
            const mainImage = product.product_images?.find((img) => img.is_main) ?? product.product_images?.[0]
            return (
              <div key={product.id} className="bg-white border border-line rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="w-14 h-16 bg-surface-muted rounded-xl overflow-hidden shrink-0 relative">
                  {mainImage ? (
                    <img src={mainImage.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted">없음</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate text-sm">{product.name}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {product.categories?.name} · {product.price.toLocaleString()}원
                  </p>
                </div>
                <ProductStatusToggle productId={product.id} currentStatus={product.status} />
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-sm text-ink font-medium px-3 py-1.5 border border-line rounded-lg hover:border-ink transition whitespace-nowrap"
                >
                  수정
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-24 text-ink-muted">
          <p className="mb-4">등록된 상품이 없습니다</p>
          <Link
            href="/admin/products/new"
            className="bg-surface-dark text-white font-medium px-6 py-3 rounded-xl hover:bg-surface-hover transition text-sm"
          >
            첫 상품 등록하기
          </Link>
        </div>
      )}
    </div>
  )
}
