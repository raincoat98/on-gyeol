'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'

export default function ProfilePage() {
  const router = useRouter()
  const userId = useAuthStore((s) => s.userId)
  const hydrated = useAuthStore((s) => s.hydrated)
  const setFullName = useAuthStore((s) => s.setFullName)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!hydrated) return
    if (!userId) { router.push('/auth/login?next=/mypage/profile'); return }
    const supabase = createClient()
    supabase.from('profiles').select('full_name, phone').eq('id', userId).limit(1).then(({ data }) => {
      const row = data?.[0]
      if (row) {
        setName(row.full_name ?? '')
        setPhone(row.phone ?? '')
      }
      setLoading(false)
    })
  }, [hydrated, userId, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, phone })
      .eq('id', userId)
    setSaving(false)
    if (error) console.error('profile upsert error:', error)
    if (!error) setFullName(name)
    setMessage(error ? '저장에 실패했습니다.' : '저장되었습니다.')
  }

  if (loading) return null

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/mypage" className="text-ink-muted hover:text-ink text-sm">← 마이페이지</Link>
      </div>
      <h1 className="font-brand text-2xl font-bold text-ink mb-6">프로필 수정</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-ink-sub mb-1 block">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="text-sm text-ink-sub mb-1 block">연락처</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full border border-line rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-ink"
          />
        </div>
        {message && (
          <p className={`text-sm text-center ${message.includes('실패') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-surface-dark text-white font-bold py-3 rounded-xl hover:bg-surface-hover transition disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  )
}
