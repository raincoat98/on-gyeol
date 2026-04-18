'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useSyncExternalStore } from 'react'

export default function CartIcon({ transparent = false }: { transparent?: boolean }) {
  // useSyncExternalStore: 세 번째 인자(server snapshot)가 0이므로 SSR/hydration mismatch 없음
  const count = useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().items.reduce((sum, i) => sum + i.quantity, 0),
    () => 0,
  )

  return (
    <Link href="/cart" className={`relative flex items-center transition-colors duration-300 hover:opacity-70 ${transparent ? 'text-white' : 'text-[#5C4A2A]'}`}>
      <ShoppingBag size={22} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#1C1C1E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
