'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth'
import type { User } from '@/types'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await api.post<User>('/auth/login', { email, password })
      setUser(user)
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }
    setLoading(false)
    router.push(next)
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-brand text-3xl font-bold text-ink tracking-widest mb-2">온결</h1>
        <p className="text-sm text-ink-muted">로그인</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-ink"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-ink"
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-surface-dark text-white font-bold py-4 rounded-xl text-base hover:bg-surface-hover transition disabled:opacity-60 mt-2"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-muted mt-6">
        아직 회원이 아니신가요?{' '}
        <Link href="/auth/signup" className="text-ink font-semibold hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
