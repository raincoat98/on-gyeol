'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'

export default function UserMenu({ transparent = false }: { transparent?: boolean }) {
  const router = useRouter()
  const email = useAuthStore((s) => s.email)
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

  const colorClass = transparent ? 'text-white hover:opacity-70' : 'text-[#5C4A2A] hover:text-[#8B6F47]'

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
        <User size={22} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-40 bg-white border border-[#E5E5EA] rounded-xl shadow-lg py-2 z-50">
          <Link
            href="/mypage"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[#2D2416] hover:bg-[#F5F5F7]"
          >
            마이페이지
          </Link>
          <Link
            href="/mypage/addresses"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[#2D2416] hover:bg-[#F5F5F7]"
          >
            배송지 관리
          </Link>
          <hr className="border-[#E5E5EA] my-1" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2.5 text-sm text-[#9C9189] hover:bg-[#F5F5F7]"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
