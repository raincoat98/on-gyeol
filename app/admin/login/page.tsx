'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-brand text-3xl font-bold text-[#5C4A2A] tracking-widest mb-2">온결</h1>
          <p className="text-sm text-[#9C9189]">관리자 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#E8DFD0] rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-[#8B6F47]"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#E8DFD0] rounded-xl px-4 py-4 text-base bg-white focus:outline-none focus:border-[#8B6F47]"
            required
          />
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#5C4A2A] text-white font-bold py-4 rounded-xl text-base hover:bg-[#8B6F47] transition disabled:opacity-60 mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
