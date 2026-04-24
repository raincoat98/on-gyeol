'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { InquiryStatus } from '@/types'

const NEXT_STATUS: Record<InquiryStatus, InquiryStatus> = {
  pending: 'replied',
  replied: 'closed',
  closed: 'pending',
}

const LABELS: Record<InquiryStatus, string> = {
  pending: '미답변',
  replied: '답변완료',
  closed: '종료',
}

const COLORS: Record<InquiryStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  replied: 'bg-green-100 text-green-700 hover:bg-green-200',
  closed: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
}

export default function InquiryStatusButton({ inquiryId, currentStatus }: { inquiryId: string; currentStatus: InquiryStatus }) {
  const [status, setStatus] = useState(currentStatus)
  const router = useRouter()

  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  async function handleClick() {
    const supabase = createClient()
    const next = NEXT_STATUS[status]
    await supabase.from('inquiries').update({ status: next }).eq('id', inquiryId)
    setStatus(next)
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${COLORS[status]}`}
    >
      {LABELS[status]}
    </button>
  )
}
