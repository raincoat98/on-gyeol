'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ProductStatus } from '@/types'

interface Props {
  productId: string
  currentStatus: ProductStatus
}

export default function ProductStatusToggle({ productId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggleSoldout() {
    setLoading(true)
    const supabase = createClient()
    const newStatus: ProductStatus = status === 'soldout' ? 'active' : 'soldout'
    await supabase.from('products').update({ status: newStatus }).eq('id', productId)
    setStatus(newStatus)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggleSoldout}
      disabled={loading}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap ${
        status === 'active'
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : status === 'soldout'
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {status === 'active' ? '판매중' : status === 'soldout' ? '품절' : '숨김'}
    </button>
  )
}
