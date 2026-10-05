'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, ApiError } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth'
import type { User } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    try {
      const user = await api.post<User>('/auth/signup', { email, password, fullName: name, phone })
      setUser(user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다. 다시 시도해주세요.')
      setLoading(false)
      return
    }
    setLoading(false)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-brand text-3xl font-bold text-ink tracking-widest mb-2">온결</h1>
        <p className="text-sm text-ink-muted">회원가입</p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-ink"
          required
        />
        <input
          type="tel"
          placeholder="연락처 (010-0000-0000)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-ink"
        />
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
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-ink"
          required
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-ink"
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-surface-dark text-white font-bold py-4 rounded-xl text-base hover:bg-surface-hover transition disabled:opacity-60 mt-2"
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-muted mt-6">
        이미 회원이신가요?{' '}
        <Link href="/auth/login" className="text-ink font-semibold hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
