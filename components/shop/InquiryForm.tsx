'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    const supabase = createClient()
    const { error: dbError } = await supabase.from('inquiries').insert({
      product_id: productId,
      customer_name: form.name,
      phone: form.phone,
      message: form.message,
      status: 'pending',
    })

    setLoading(false)
    if (dbError) {
      setError('문의 등록 중 오류가 발생했습니다. 다시 시도해 주세요.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-[#EFEFEF] rounded-xl p-8 text-center">
        <p className="text-lg font-semibold text-[#5C4A2A] mb-2">문의가 접수되었습니다</p>
        <p className="text-sm text-[#9C9189]">빠른 시일 내에 연락드리겠습니다.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="이름"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border border-[#E5E5EA] rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-[#1C1C1E]"
      />
      <input
        type="tel"
        placeholder="연락처 (010-0000-0000)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full border border-[#E5E5EA] rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-[#1C1C1E]"
      />
      <textarea
        placeholder={`[${productName}] 에 대해 문의할 내용을 적어주세요.`}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={4}
        className="w-full border border-[#E5E5EA] rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-[#1C1C1E] resize-none"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-[#1C1C1E] text-white font-bold py-4 rounded-xl text-base hover:bg-[#3A3A3C] transition disabled:opacity-60"
      >
        {loading ? '접수 중...' : '문의 접수하기'}
      </button>
    </form>
  )
}
