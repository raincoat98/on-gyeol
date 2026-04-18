'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'
import CartIcon from '@/components/shop/CartIcon'
import UserMenu from '@/components/shop/UserMenu'

const CATEGORIES = [
  { name: '전체', slug: 'all' },
  { name: '상의', slug: 'tops' },
  { name: '하의', slug: 'bottoms' },
  { name: '원피스', slug: 'onepiece' },
  { name: '아우터', slug: 'outer' },
  { name: '세일', slug: 'sale' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = isHome && !scrolled && !menuOpen
  const textColor = transparent ? 'text-white' : 'text-[#5C4A2A]'

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      transparent
        ? 'bg-transparent border-b border-transparent'
        : 'bg-white/80 backdrop-blur-md border-b border-[#E8DFD0]/60'
    }`}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className={`font-brand text-2xl font-bold tracking-widest transition-colors duration-300 ${textColor}`}>
          온결
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`transition-colors duration-300 hover:opacity-70 ${textColor}`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* 아이콘 */}
        <div className={`flex items-center gap-4 transition-colors duration-300 ${textColor}`}>
          <Link href="/search" className={`flex items-center hover:opacity-70 transition-opacity ${textColor}`}>
            <Search size={22} />
          </Link>
          <CartIcon transparent={transparent} />
          <UserMenu transparent={transparent} />
          {/* 모바일 메뉴 */}
          <button
            className={`md:hidden ${textColor}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-[#E8DFD0] px-4 py-4 flex flex-col gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="text-lg font-medium text-[#5C4A2A] py-1"
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
