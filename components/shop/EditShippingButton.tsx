'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orderId: string
  current: {
    name: string
    phone: string
    address: string
    memo: string | null
  }
}

export default function EditShippingButton({ orderId, current }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(current.name)
  const [phone, setPhone] = useState(current.phone)
  const [address, setAddress] = useState(current.address)
  const [memo, setMemo] = useState(current.memo ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleOpen() {
    setName(current.name)
    setPhone(current.phone)
    setAddress(current.address)
    setMemo(current.memo ?? '')
    setError('')
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('이름, 연락처, 주소를 모두 입력해 주세요.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/orders/update-shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, customerName: name, customerPhone: phone, customerAddress: address, customerMemo: memo }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? '수정에 실패했습니다.'); return }
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-ink-muted hover:text-ink transition underline underline-offset-2"
      >
        수정
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !loading && setOpen(false)} />
          <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-sm mx-4 p-6 flex flex-col gap-3">
            <h2 className="text-base font-semibold text-ink mb-1">배송지 수정</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="받는 분 이름 *"
              className="w-full border border-line px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="연락처 *"
              className="w-full border border-line px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
            />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="배송 주소 *"
              className="w-full border border-line px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
            />
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="배송 메모 (선택)"
              className="w-full border border-line px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 border border-line text-ink-muted text-sm py-3 hover:border-ink hover:text-ink transition disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-ink text-white text-sm py-3 hover:bg-ink-sub transition disabled:opacity-60"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
