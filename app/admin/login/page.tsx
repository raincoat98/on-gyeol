'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import type { User } from '@/types'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    let user: User | null = null
    try {
      user = await api.post<User>('/auth/login', { email, password })
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
    if (!user) {
      setLoading(false)
      return
    }
    if (user.role !== 'admin') {
      setError('관리자 권한이 없습니다.')
      await api.post('/auth/logout')
      setLoading(false)
      return
    }
    setLoading(false)
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-brand text-3xl font-bold text-ink tracking-widest mb-2">온결</h1>
          <p className="text-sm text-ink-muted">관리자 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-ink-sub"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-ink-sub"
            required
          />
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-surface-dark text-white font-bold py-4 rounded-xl text-base hover:bg-ink-sub transition disabled:opacity-60 mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
