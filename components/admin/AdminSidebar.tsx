'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, PlusCircle, MessageSquare, LayoutDashboard, LogOut, ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/products', label: '상품 관리', icon: Package },
  { href: '/admin/products/new', label: '상품 등록', icon: PlusCircle },
  { href: '/admin/orders', label: '주문 관리', icon: ShoppingCart },
  { href: '/admin/inquiries', label: '문의 관리', icon: MessageSquare },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-56 bg-[#5C4A2A] text-white flex flex-col min-h-screen">
      <div className="px-6 py-6 border-b border-[#8B6F47]">
        <p className="font-brand text-2xl font-bold tracking-widest">온결</p>
        <p className="text-xs text-[#D4C9B8] mt-1">관리자</p>
      </div>
      <nav className="flex-1 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-colors ${
                active ? 'bg-[#8B6F47] text-white' : 'text-[#D4C9B8] hover:bg-[#8B6F47] hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-4 text-sm text-[#D4C9B8] hover:text-white hover:bg-[#8B6F47] transition-colors"
      >
        <LogOut size={18} />
        로그아웃
      </button>
    </aside>
  )
}
