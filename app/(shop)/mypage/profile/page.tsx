'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login?next=/mypage/profile'); return }
      const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
      if (data) {
        setName(data.full_name ?? '')
        setPhone(data.phone ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, phone })
      .eq('id', user.id)
    setSaving(false)
    setMessage(error ? '저장에 실패했습니다.' : '저장되었습니다.')
  }

  if (loading) return null

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/mypage" className="text-[#9C9189] hover:text-[#5C4A2A] text-sm">← 마이페이지</Link>
      </div>
      <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-6">프로필 수정</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-[#8B6F47] mb-1 block">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-[#8B6F47]"
          />
        </div>
        <div>
          <label className="text-sm text-[#8B6F47] mb-1 block">연락처</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full border border-[#E8DFD0] rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-[#8B6F47]"
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
          className="bg-[#5C4A2A] text-white font-bold py-3 rounded-xl hover:bg-[#8B6F47] transition disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  )
}
