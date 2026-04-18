'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, PlusCircle, MessageSquare, LayoutDashboard, LogOut, ShoppingCart, Star, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/products', label: '상품 관리', icon: Package },
  { href: '/admin/products/new', label: '상품 등록', icon: PlusCircle },
  { href: '/admin/orders', label: '주문 관리', icon: ShoppingCart },
  { href: '/admin/inquiries', label: '문의 관리', icon: MessageSquare },
  { href: '/admin/reviews', label: '리뷰 관리', icon: Star },
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
    <aside className="w-56 bg-surface-dark text-white flex flex-col min-h-screen">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-brand text-2xl font-bold tracking-widest">온결</p>
        <p className="text-xs text-white/40 mt-1 tracking-widest uppercase">Admin</p>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 px-6 py-3 text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors border-t border-white/10"
      >
        <ExternalLink size={16} />
        쇼핑몰 보기
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-4 text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors border-t border-white/10"
      >
        <LogOut size={16} />
        로그아웃
      </button>
    </aside>
  )
}
