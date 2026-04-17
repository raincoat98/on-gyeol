'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

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
}

interface OptionRow {
  color: string
  size: string
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'FREE']

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [options, setOptions] = useState<OptionRow[]>([{ color: '', size: '' }])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setImages(files)
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)))
  }

  function addOption() {
    setOptions([...options, { color: '', size: '' }])
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
    const supabase = createClient()
    const slug = slugify(name)

    // 상품 등록
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        category_id: categoryId || null,
        price: Number(price),
        sale_price: salePrice ? Number(salePrice) : null,
        short_description: shortDesc || null,
        description: description || null,
        status: status as 'active' | 'soldout' | 'hidden',
        is_featured: isFeatured,
        seo_title: name,
        seo_description: shortDesc || null,
      })
      .select()
      .single()

    if (productError || !product) {
      setLoading(false)
      setMessage('상품 등록 중 오류가 발생했습니다.')
      return
    }

    // 이미지 업로드
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop()
      const path = `products/${product.id}/${Date.now()}-${i}.${ext}`
      const { data: uploadData } = await supabase.storage
        .from('product-images')
        .upload(path, file)

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)

        await supabase.from('product_images').insert({
          product_id: product.id,
          image_url: publicUrl,
          sort_order: i,
          is_main: i === 0,
        })
      }
    }

    // 옵션 등록
    const validOptions = options.filter((o) => o.color || o.size)
    if (validOptions.length > 0) {
      await supabase.from('product_options').insert(
        validOptions.map((o) => ({
          product_id: product.id,
          color: o.color || null,
          size: o.size || null,
          stock_qty: 99,
          status: 'active' as const,
        }))
      )
    }

    setLoading(false)
    setMessage('상품이 온결에 잘 담겼습니다! ✓')
    setTimeout(() => router.push('/admin/products'), 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 이미지 업로드 */}
      <div>
        <label className="block font-semibold text-[#5C4A2A] mb-3">상품 사진</label>
        <div
          className="border-2 border-dashed border-[#E8DFD0] rounded-xl p-8 text-center cursor-pointer hover:border-[#8B6F47] transition"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrls.length > 0 ? (
            <div className="flex gap-3 flex-wrap justify-center">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-28 rounded-lg overflow-hidden">
                  <Image src={url} alt="" fill className="object-cover" sizes="96px" />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-[#5C4A2A] text-white text-xs text-center py-0.5">
                      대표
                    </span>
                  )}
                </div>
              ))}
              <div className="w-24 h-28 border-2 border-dashed border-[#E8DFD0] rounded-lg flex items-center justify-center text-[#9C9189] text-sm">
                + 추가
              </div>
            </div>
          ) : (
            <>
              <p className="text-3xl mb-2">📷</p>
              <p className="text-[#9C9189] text-sm">사진을 선택하세요</p>
              <p className="text-[#9C9189] text-xs mt-1">첫 번째 사진이 대표 이미지가 됩니다</p>
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
      <div className="bg-white border border-[#E8DFD0] rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-[#5C4A2A]">기본 정보</h2>

        <div>
          <label className="block text-sm text-[#8B6F47] mb-1.5">상품명 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 봄 데일리 블라우스"
            className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#8B6F47]"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[#8B6F47] mb-1.5">카테고리</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#8B6F47] bg-white"
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#8B6F47] mb-1.5">판매가 *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#8B6F47]"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#8B6F47] mb-1.5">할인가 (없으면 비워두기)</label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#8B6F47]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#8B6F47] mb-1.5">한 줄 설명</label>
          <input
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="예: 편안한 소재로 일상에 따뜻함을 더하는 봄 블라우스"
            className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#8B6F47]"
          />
        </div>
      </div>

      {/* 옵션 (색상/사이즈) */}
      <div className="bg-white border border-[#E8DFD0] rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-[#5C4A2A]">색상 / 사이즈</h2>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              type="text"
              value={opt.color}
              onChange={(e) => {
                const next = [...options]
                next[i].color = e.target.value
                setOptions(next)
              }}
              placeholder="색상 (예: 아이보리)"
              className="flex-1 border border-[#E8DFD0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B6F47]"
            />
            <select
              value={opt.size}
              onChange={(e) => {
                const next = [...options]
                next[i].size = e.target.value
                setOptions(next)
              }}
              className="flex-1 border border-[#E8DFD0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B6F47] bg-white"
            >
              <option value="">사이즈 선택</option>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {options.length > 1 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="text-[#9C9189] hover:text-red-500 text-xl font-bold px-2"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="text-sm text-[#8B6F47] hover:text-[#5C4A2A] text-left"
        >
          + 옵션 추가
        </button>
      </div>

      {/* 상태 */}
      <div className="bg-white border border-[#E8DFD0] rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-[#5C4A2A]">판매 상태</h2>
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
                className="w-5 h-5 accent-[#5C4A2A]"
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
            className="w-5 h-5 accent-[#5C4A2A]"
          />
          <span className="text-base">베스트/신상품 강조 표시</span>
        </label>
      </div>

      {/* 상세 설명 */}
      <div className="bg-white border border-[#E8DFD0] rounded-xl p-6">
        <h2 className="font-semibold text-[#5C4A2A] mb-3">상세 설명 (선택)</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="상품에 대한 자세한 설명을 입력하세요."
          className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#8B6F47] resize-none"
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
        className="bg-[#5C4A2A] text-white font-bold py-5 rounded-xl text-lg hover:bg-[#8B6F47] transition disabled:opacity-60"
      >
        {loading ? '등록 중...' : '상품 등록하기'}
      </button>
    </form>
  )
}
