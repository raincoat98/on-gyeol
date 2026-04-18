'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type AuthStore = {
  userId: string | null
  email: string | null
  fullName: string | null
  hydrated: boolean
  initialize: () => () => void
  setFullName: (name: string) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set) => ({
  userId: null,
  email: null,
  fullName: null,
  hydrated: false,

  initialize: () => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const userId = session?.user?.id ?? null
      set({
        userId,
        email: session?.user?.email ?? null,
        fullName: null,
        hydrated: true,
      })
      if (userId) {
        supabase.from('profiles').select('full_name').eq('id', userId).single()
          .then(({ data }) => set({ fullName: data?.full_name ?? null }))
      }
    })
    return () => subscription.unsubscribe()
  },

  setFullName: (name) => set({ fullName: name || null }),

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ userId: null, email: null })
  },
}))
