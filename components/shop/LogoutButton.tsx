'use client'

import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await api.post('/auth/logout')
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-ink-muted hover:text-red-400 transition"
    >
      로그아웃
    </button>
  )
}
