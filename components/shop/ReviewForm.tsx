'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import StarRating from './StarRating'

interface ReviewFormProps {
  productId: string
  orderItemId: string
  // 서버가 쿠키로 사용자를 판별하므로 더 이상 사용하지 않는다. 기존 호출부 호환을 위해 optional 유지.
  userId?: string
}

export default function ReviewForm({ productId, orderItemId }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (rating === 0) { setError('별점을 선택해 주세요.'); return }
    if (content.trim().length < 10) { setError('내용을 10자 이상 입력해 주세요.'); return }

    setLoading(true)
    try {
      await api.post('/reviews', {
        productId,
        orderItemId,
        rating,
        content: content.trim(),
      })
      router.push('/mypage/reviews')
      router.refresh()
    } catch {
      setError('리뷰 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-ink-muted mb-2 tracking-widest uppercase">Rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <textarea
        placeholder="구매하신 상품에 대한 솔직한 리뷰를 남겨주세요. (10자 이상)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="w-full border border-line px-4 py-3 text-sm bg-white focus:outline-none focus:border-ink resize-none"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 border border-line text-ink-muted text-sm tracking-widest py-4 hover:border-ink hover:text-ink transition disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-ink text-white text-sm tracking-widest py-4 hover:bg-ink-sub transition disabled:opacity-60"
        >
          {loading ? '등록 중...' : '리뷰 등록하기'}
        </button>
      </div>
    </form>
  )
}
