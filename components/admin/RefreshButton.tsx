'use client'

import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function RefreshButton() {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)

  function handleClick() {
    setSpinning(true)
    router.refresh()
    setTimeout(() => setSpinning(false), 600)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition"
      aria-label="새로고침"
    >
      <RefreshCw size={13} className={spinning ? 'animate-spin' : ''} />
      새로고침
    </button>
  )
}
