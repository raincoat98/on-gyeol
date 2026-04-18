'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: dbError } = await supabase.from('orders').delete().eq('id', orderId)
    setLoading(false)
    if (dbError) { setError('삭제에 실패했습니다.'); return }
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-red-400 hover:text-red-600 transition"
      >
        삭제
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !loading && setOpen(false)} />
          <div className="relative bg-white w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-ink mb-2">주문을 삭제하시겠습니까?</h2>
            <p className="text-sm text-ink-muted mb-6">삭제 후에는 복구할 수 없습니다.</p>
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 border border-line text-ink-muted text-sm py-3 hover:border-ink hover:text-ink transition disabled:opacity-60"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-500 text-white text-sm py-3 hover:bg-red-600 transition disabled:opacity-60"
              >
                {loading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
