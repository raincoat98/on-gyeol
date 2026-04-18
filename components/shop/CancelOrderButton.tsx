'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCancel() {
    if (!confirm('주문을 취소하시겠습니까?')) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/orders/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? '취소에 실패했습니다.')
      return
    }
    router.refresh()
  }

  return (
    <div className="mt-8">
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full border border-line text-ink-muted text-sm py-3.5 hover:border-red-300 hover:text-red-500 transition disabled:opacity-60"
      >
        {loading ? '처리 중...' : '주문 취소'}
      </button>
    </div>
  )
}
