'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, Phone } from 'lucide-react'
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

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4] border-b border-[#E8DFD0]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="font-brand text-2xl font-bold text-[#5C4A2A] tracking-widest">
          온결
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-[#5C4A2A]">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="hover:text-[#8B6F47] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* 아이콘 */}
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-[#5C4A2A] hover:text-[#8B6F47]">
            <Search size={22} />
          </Link>
          <CartIcon />
          <UserMenu />
          <a href="tel:01000000000" className="hidden md:block text-[#5C4A2A] hover:text-[#8B6F47]">
            <Phone size={22} />
          </a>
          {/* 모바일 메뉴 */}
          <button
            className="md:hidden text-[#5C4A2A]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-[#FAF8F4] border-t border-[#E8DFD0] px-4 py-4 flex flex-col gap-4">
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
          <a
            href="tel:01000000000"
            className="flex items-center gap-2 text-[#8B6F47] font-medium mt-2"
          >
            <Phone size={18} />
            전화 문의
          </a>
        </div>
      )}
    </header>
  )
}
