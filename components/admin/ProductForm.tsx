'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/api/client'
import type { Category, Product, ProductImage, ProductOption } from '@/types'

interface ProductFormProps {
  categories: Category[]
  initialData?: {
    id: string
    name: string
    slug: string
    category_id: string | null
    price: number
    sale_price: number | null
    short_description: string | null
    description: string | null
    status: string
    is_featured: boolean
    seo_title: string | null
    seo_description: string | null
  }
  initialImages?: { id: string; image_url: string; is_main: boolean }[]
  initialOptions?: { id: string; color: string | null; size: string | null; stock_qty: number }[]
}

interface OptionRow {
  color: string
  size: string
  stock_qty: string
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'FREE']

export default function ProductForm({ categories, initialData, initialImages = [], initialOptions = [] }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEdit = !!initialData?.id

  const [name, setName] = useState(initialData?.name ?? '')
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '')
  const [price, setPrice] = useState(String(initialData?.price ?? ''))
  const [salePrice, setSalePrice] = useState(String(initialData?.sale_price ?? ''))
  const [shortDesc, setShortDesc] = useState(initialData?.short_description ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [status, setStatus] = useState(initialData?.status ?? 'active')
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false)
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState(initialImages)
  const [options, setOptions] = useState<OptionRow[]>(
    initialOptions.length > 0
      ? initialOptions.map((o) => ({ color: o.color ?? '', size: o.size ?? '', stock_qty: String(o.stock_qty) }))
      : [{ color: '', size: '', stock_qty: '99' } satisfies OptionRow]
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setImages(files)
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)))
  }

  function addOption() {
    setOptions([...options, { color: '', size: '', stock_qty: '99' }])
  }

  function removeOption(i: number) {
    setOptions(options.filter((_, idx) => idx !== i))
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    if (!name || !price) {
      setMessage('상품명과 가격은 필수 입력입니다.')
      return
    }

    setLoading(true)

    try {
      let productId: string

      if (isEdit) {
        // 수정
        await api.patch<Product>(`/products/${initialData!.id}`, {
          name,
          categoryId: categoryId || null,
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          shortDescription: shortDesc || null,
          description: description || null,
          status,
          isFeatured,
          seoTitle: name,
          seoDescription: shortDesc || null,
        })
        productId = initialData!.id
      } else {
        // 신규 등록
        const slug = slugify(name)
        const product = await api.post<Product>('/products', {
          name,
          slug,
          categoryId: categoryId || null,
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          shortDescription: shortDesc || null,
          description: description || null,
          status,
          isFeatured,
          seoTitle: name,
          seoDescription: shortDesc || null,
        })
        productId = product.id
      }

      // 새 이미지 업로드 — 서버가 파일 저장과 product_image 생성을 함께 처리한다.
      const existingCount = existingImages.length
      for (let i = 0; i < images.length; i++) {
        const form = new FormData()
        form.append('file', images[i])
        form.append('isMain', String(existingCount === 0 && i === 0))
        await api.upload<ProductImage>(`/products/${productId}/images`, form)
      }

      // 옵션 일괄 교체
      const validOptions = options.filter((o) => o.color || o.size)
      await api.put<ProductOption[]>(
        `/products/${productId}/options`,
        validOptions.map((o) => ({
          color: o.color || null,
          size: o.size || null,
          stockQty: Number(o.stock_qty) || 99,
        }))
      )
    } catch {
      setLoading(false)
      setMessage(isEdit ? '상품 수정 중 오류가 발생했습니다.' : '상품 등록 중 오류가 발생했습니다.')
      return
    }

    setLoading(false)
    setMessage(isEdit ? '수정되었습니다. ✓' : '상품이 온결에 잘 담겼습니다! ✓')
    setTimeout(() => router.push('/admin/products'), 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 이미지 업로드 */}
      <div>
        <label className="block font-semibold text-ink mb-3">상품 사진</label>
        <div
          className="border-2 border-dashed border-line rounded-xl p-8 text-center cursor-pointer hover:border-ink transition"
          onClick={() => fileInputRef.current?.click()}
        >
          {(existingImages.length > 0 || previewUrls.length > 0) ? (
            <div className="flex gap-3 flex-wrap justify-center">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-24 h-28 rounded-lg overflow-hidden group">
                  <Image src={img.image_url} alt="" fill className="object-cover" sizes="96px" />
                  {img.is_main && (
                    <span className="absolute bottom-0 left-0 right-0 bg-surface-dark text-white text-xs text-center py-0.5">
                      대표
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await api.del(`/product-images/${img.id}`)
                      setExistingImages((prev) => prev.filter((i) => i.id !== img.id))
                    }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
              {previewUrls.map((url, i) => (
                <div key={`new-${i}`} className="relative w-24 h-28 rounded-lg overflow-hidden">
                  <Image src={url} alt="" fill className="object-cover" sizes="96px" />
                  <span className="absolute bottom-0 left-0 right-0 bg-ink-muted text-white text-xs text-center py-0.5">NEW</span>
                </div>
              ))}
              <div className="w-24 h-28 border-2 border-dashed border-line rounded-lg flex items-center justify-center text-ink-muted text-sm">
                + 추가
              </div>
            </div>
          ) : (
            <>
              <p className="text-3xl mb-2">📷</p>
              <p className="text-ink-muted text-sm">사진을 선택하세요</p>
              <p className="text-ink-muted text-xs mt-1">첫 번째 사진이 대표 이미지가 됩니다</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* 기본 정보 */}
      <div className="bg-white border border-line rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-ink">기본 정보</h2>

        <div>
          <label className="block text-sm text-ink-muted mb-1.5">상품명 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 봄 데일리 블라우스"
            className="w-full border border-line rounded-xl px-4 py-3 text-base focus:outline-none focus:border-ink"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-ink-muted mb-1.5">카테고리</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-base focus:outline-none focus:border-ink bg-white"
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink-muted mb-1.5">판매가 *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full border border-line rounded-xl px-4 py-3 text-base focus:outline-none focus:border-ink"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-ink-muted mb-1.5">할인가 (없으면 비워두기)</label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full border border-line rounded-xl px-4 py-3 text-base focus:outline-none focus:border-ink"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-ink-muted mb-1.5">한 줄 설명</label>
          <input
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="예: 편안한 소재로 일상에 따뜻함을 더하는 봄 블라우스"
            className="w-full border border-line rounded-xl px-4 py-3 text-base focus:outline-none focus:border-ink"
          />
        </div>
      </div>

      {/* 옵션 (색상/사이즈) */}
      <div className="bg-white border border-line rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-ink">색상 / 사이즈</h2>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              type="text"
              value={opt.color}
              onChange={(e) => { const next = [...options]; next[i].color = e.target.value; setOptions(next) }}
              placeholder="색상 (예: 아이보리)"
              className="flex-1 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink"
            />
            <select
              value={opt.size}
              onChange={(e) => { const next = [...options]; next[i].size = e.target.value; setOptions(next) }}
              className="flex-1 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink bg-white"
            >
              <option value="">사이즈</option>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="number"
              value={opt.stock_qty}
              onChange={(e) => { const next = [...options]; next[i].stock_qty = e.target.value; setOptions(next) }}
              placeholder="재고"
              min="0"
              className="w-20 border border-line rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-ink"
            />
            {options.length > 1 && (
              <button type="button" onClick={() => removeOption(i)} className="text-ink-muted hover:text-red-500 text-xl font-bold px-2">×</button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="text-sm text-ink-muted hover:text-ink text-left"
        >
          + 옵션 추가
        </button>
      </div>

      {/* 상태 */}
      <div className="bg-white border border-line rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-ink">판매 상태</h2>
        <div className="flex gap-4">
          {[
            { value: 'active', label: '판매중' },
            { value: 'soldout', label: '품절' },
            { value: 'hidden', label: '숨김' },
          ].map((s) => (
            <label key={s.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s.value}
                checked={status === s.value}
                onChange={(e) => setStatus(e.target.value)}
                className="w-5 h-5 accent-ink"
              />
              <span className="text-base">{s.label}</span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-5 h-5 accent-ink"
          />
          <span className="text-base">베스트/신상품 강조 표시</span>
        </label>
      </div>

      {/* 상세 설명 */}
      <div className="bg-white border border-line rounded-xl p-6">
        <h2 className="font-semibold text-ink mb-3">상세 설명 (선택)</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="상품에 대한 자세한 설명을 입력하세요."
          className="w-full border border-line rounded-xl px-4 py-3 text-base focus:outline-none focus:border-ink resize-none"
        />
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`text-center py-3 rounded-xl font-medium ${
          message.includes('오류') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* 저장 */}
      <button
        type="submit"
        disabled={loading}
        className="bg-surface-dark text-white font-bold py-5 rounded-xl text-lg hover:bg-surface-hover transition disabled:opacity-60"
      >
        {loading ? (isEdit ? '저장 중...' : '등록 중...') : (isEdit ? '저장하기' : '상품 등록하기')}
      </button>
    </form>
  )
}
