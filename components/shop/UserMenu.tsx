'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'

export default function UserMenu({ transparent = false }: { transparent?: boolean }) {
  const router = useRouter()
  const email = useAuthStore((s) => s.email)
  const fullName = useAuthStore((s) => s.fullName)
  const signOut = useAuthStore((s) => s.signOut)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const colorClass = transparent ? 'text-white hover:opacity-70' : 'text-ink hover:text-ink-sub'

  if (!email) {
    return (
      <Link href="/auth/login" className={`text-sm font-medium transition-colors duration-300 ${colorClass}`}>
        로그인
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center transition-colors duration-300 ${colorClass}`}
        aria-label="내 계정"
      >
        {fullName ? (
          <span className={`text-sm font-medium transition-colors duration-300 ${colorClass}`}>
            {fullName}
          </span>
        ) : (
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
            transparent ? 'bg-white/20 text-white' : 'bg-ink text-white'
          }`}>
            {email[0].toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-40 bg-white border border-line rounded-xl shadow-lg py-2 z-50">
          <Link
            href="/mypage"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink hover:bg-surface"
          >
            마이페이지
          </Link>
          <Link
            href="/mypage/addresses"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink hover:bg-surface"
          >
            배송지 관리
          </Link>
          <hr className="border-line my-1" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2.5 text-sm text-ink-muted hover:bg-surface"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
