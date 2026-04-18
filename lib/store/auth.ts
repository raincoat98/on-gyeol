'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type AuthStore = {
  userId: string | null
  email: string | null
  hydrated: boolean
  initialize: () => () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set) => ({
  userId: null,
  email: null,
  hydrated: false,

  initialize: () => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      set({
        userId: session?.user?.id ?? null,
        email: session?.user?.email ?? null,
        hydrated: true,
      })
    })
    return () => subscription.unsubscribe()
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ userId: null, email: null })
  },
}))
