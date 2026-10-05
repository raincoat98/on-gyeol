'use client'

import { create } from 'zustand'
import { api } from '@/lib/api/client'
import type { User, UserRole } from '@/types'

type AuthStore = {
  userId: string | null
  email: string | null
  fullName: string | null
  role: UserRole | null
  hydrated: boolean
  initialize: () => () => void
  setUser: (user: User) => void
  setFullName: (name: string) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set) => ({
  userId: null,
  email: null,
  fullName: null,
  role: null,
  hydrated: false,

  initialize: () => {
    let cancelled = false
    api
      .get<User>('/auth/me')
      .then((user) => {
        if (cancelled) return
        set({
          userId: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          hydrated: true,
        })
      })
      .catch(() => {
        if (cancelled) return
        set({ userId: null, email: null, fullName: null, role: null, hydrated: true })
      })
    return () => {
      cancelled = true
    }
  },

  /** 로그인/가입 직후 클라이언트 상태를 즉시 반영한다(레이아웃이 유지되어 initialize 가 다시 돌지 않으므로). */
  setUser: (user) =>
    set({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      hydrated: true,
    }),

  setFullName: (name) => set({ fullName: name || null }),

  signOut: async () => {
    await api.post('/auth/logout')
    set({ userId: null, email: null, fullName: null, role: null })
  },
}))