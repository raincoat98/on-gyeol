'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function UserMenu() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  if (!email) {
    return (
      <Link href="/auth/login" className="text-[#5C4A2A] hover:text-[#8B6F47] text-sm font-medium">
        로그인
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[#5C4A2A] hover:text-[#8B6F47]"
        aria-label="내 계정"
      >
        <User size={22} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-40 bg-white border border-[#E8DFD0] rounded-xl shadow-lg py-2 z-50">
          <Link
            href="/mypage"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[#2D2416] hover:bg-[#FAF8F4]"
          >
            마이페이지
          </Link>
          <Link
            href="/mypage/addresses"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[#2D2416] hover:bg-[#FAF8F4]"
          >
            배송지 관리
          </Link>
          <hr className="border-[#E8DFD0] my-1" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2.5 text-sm text-[#9C9189] hover:bg-[#FAF8F4]"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
