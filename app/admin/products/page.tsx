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
        <h1 className="font-brand text-2xl font-bold text-[#5C4A2A]">상품 관리</h1>
        <Link
          href="/admin/products/new"
          className="bg-[#5C4A2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#8B6F47] transition text-sm"
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
                ? 'bg-[#5C4A2A] text-white border-[#5C4A2A]'
                : 'border-[#E8DFD0] text-[#9C9189] hover:border-[#8B6F47]'
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {products && products.length > 0 ? (
        <div className="flex flex-col gap-3">
          {(products as ProductWithImages[]).map((product) => {
            const mainImage = product.product_images?.find((img) => img.is_main) ?? product.product_images?.[0]
            return (
              <div key={product.id} className="bg-white border border-[#E8DFD0] rounded-xl p-4 flex items-center gap-4">
                {/* 이미지 */}
                <div className="w-16 h-20 bg-[#E8DFD0] rounded-lg overflow-hidden flex-shrink-0 relative">
                  {mainImage ? (
                    <img src={mainImage.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#9C9189]">없음</div>
                  )}
                </div>
                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2D2416] truncate">{product.name}</p>
                  <p className="text-sm text-[#9C9189]">{product.categories?.name} · {product.price.toLocaleString()}원</p>
                </div>
                {/* 상태 토글 */}
                <ProductStatusToggle productId={product.id} currentStatus={product.status} />
                {/* 수정 버튼 */}
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-sm text-[#8B6F47] hover:text-[#5C4A2A] font-medium px-3 py-1.5 border border-[#E8DFD0] rounded-lg hover:border-[#8B6F47] transition whitespace-nowrap"
                >
                  수정
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-24 text-[#9C9189]">
          <p className="text-lg mb-4">등록된 상품이 없습니다</p>
          <Link
            href="/admin/products/new"
            className="bg-[#5C4A2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#8B6F47] transition"
          >
            첫 상품 등록하기
          </Link>
        </div>
      )}
    </div>
  )
}
