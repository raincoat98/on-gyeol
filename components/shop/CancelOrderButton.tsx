'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCancel() {
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
    router.push('/mypage/orders')
  }

  return (
    <>
      <div className="mt-8">
        <button
          onClick={() => setOpen(true)}
          className="w-full border border-line text-ink-muted text-sm py-3.5 hover:border-red-300 hover:text-red-500 transition"
        >
          주문 취소
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !loading && setOpen(false)} />
          <div className="relative bg-white w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-ink mb-2">주문을 취소하시겠습니까?</h2>
            <p className="text-sm text-ink-muted mb-6">취소 후에는 되돌릴 수 없습니다.</p>
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 border border-line text-ink-muted text-sm py-3 hover:border-ink hover:text-ink transition disabled:opacity-60"
              >
                닫기
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-red-500 text-white text-sm py-3 hover:bg-red-600 transition disabled:opacity-60"
              >
                {loading ? '처리 중...' : '취소 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
