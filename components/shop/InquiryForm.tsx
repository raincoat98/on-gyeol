'use client'

import { useState } from 'react'
import { api } from '@/lib/api/client'

interface InquiryFormProps {
  productId: string
  productName: string
}

export default function InquiryForm({ productId, productName }: InquiryFormProps) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.phone || !form.message) {
      setError('모든 항목을 입력해 주세요.')
      return
    }

    setLoading(true)
    try {
      await api.post('/inquiries', {
        productId: productId || undefined,
        customerName: form.name,
        phone: form.phone,
        message: form.message,
      })
      setDone(true)
    } catch {
      setError('문의 등록 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="border border-line p-8 text-center">
        <p className="text-sm font-medium text-ink mb-1">문의가 접수되었습니다</p>
        <p className="text-xs text-ink-muted">빠른 시일 내에 연락드리겠습니다.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="이름"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border border-line px-4 py-3 text-sm bg-white focus:outline-none focus:border-ink"
      />
      <input
        type="tel"
        placeholder="연락처 (010-0000-0000)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full border border-line px-4 py-3 text-sm bg-white focus:outline-none focus:border-ink"
      />
      <textarea
        placeholder={productName ? `${productName}에 대해 문의할 내용을 적어주세요.` : '문의할 내용을 적어주세요.'}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={5}
        className="w-full border border-line px-4 py-3 text-sm bg-white focus:outline-none focus:border-ink resize-none"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-ink text-white text-sm tracking-widest py-4 hover:bg-ink-sub transition disabled:opacity-60"
      >
        {loading ? '접수 중...' : '문의 접수하기'}
      </button>
    </form>
  )
}
