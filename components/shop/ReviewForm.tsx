'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StarRating from './StarRating'

interface ReviewFormProps {
  productId: string
  orderItemId: string
  userId: string
}

export default function ReviewForm({ productId, orderItemId, userId }: ReviewFormProps) {
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
    const supabase = createClient()
    const { error: dbError } = await supabase.from('reviews').insert({
      product_id: productId,
      order_item_id: orderItemId,
      user_id: userId,
      rating,
      content: content.trim(),
    })
    setLoading(false)

    if (dbError) {
      setError('리뷰 등록 중 오류가 발생했습니다.')
      return
    }
    router.push('/mypage/reviews')
    router.refresh()
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
      <button
        type="submit"
        disabled={loading}
        className="bg-ink text-white text-sm tracking-widest py-4 hover:bg-ink-sub transition disabled:opacity-60"
      >
        {loading ? '등록 중...' : '리뷰 등록하기'}
      </button>
    </form>
  )
}
