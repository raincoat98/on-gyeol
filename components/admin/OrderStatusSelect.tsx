'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Status = 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled'

const STATUS_LABELS: Record<Status, string> = {
  pending: '결제대기',
  paid: '결제완료',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
}

const STATUS_COLORS: Record<Status, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipping: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: Status
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleChange(next: Status) {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: next }).eq('id', orderId)
    setStatus(next)
    setLoading(false)
    router.refresh()
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value as Status)}
      disabled={loading}
      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[status]}`}
    >
      {(Object.entries(STATUS_LABELS) as [Status, string][]).map(([v, label]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  )
}
