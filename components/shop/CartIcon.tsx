'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useState } from 'react'

export default function CartIcon() {
  const totalCount = useCartStore((s) => s.totalCount)
  // Avoid hydration mismatch — render count only on client
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(totalCount())
  })

  return (
    <Link href="/cart" className="relative text-[#5C4A2A] hover:text-[#8B6F47]">
      <ShoppingBag size={22} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#5C4A2A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
