'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'
import type { Address } from '@/types'

const LABELS = ['집', '회사', '기타']

type FormState = {
  label: string
  recipient_name: string
  phone: string
  address: string
  is_default: boolean
}

const EMPTY_FORM: FormState = {
  label: '집',
  recipient_name: '',
  phone: '',
  address: '',
  is_default: false,
}

export default function AddressesPage() {
  const router = useRouter()
  const userId = useAuthStore((s) => s.userId)
  const hydrated = useAuthStore((s) => s.hydrated)
  const supabase = createClient()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadAddresses = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', uid)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
    setAddresses(data ?? [])
  }, [supabase])

  useEffect(() => {
    if (!hydrated) return
    if (!userId) { router.push('/auth/login?next=/mypage/addresses'); return }
    loadAddresses(userId).then(() => setLoading(false))
  }, [hydrated, userId, router, loadAddresses])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setError('')
    setSaving(true)

    // 기본 배송지로 설정 시 기존 기본 해제
    if (form.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
    }

    const { error: insertError } = await supabase.from('addresses').insert({
      user_id: userId,
      label: form.label,
      recipient_name: form.recipient_name,
      phone: form.phone,
      address: form.address,
      is_default: form.is_default,
    })

    setSaving(false)
    if (insertError) {
      setError('저장에 실패했습니다.')
      return
    }

    setForm(EMPTY_FORM)
    setShowForm(false)
    await loadAddresses(userId)
  }

  async function handleDelete(id: string) {
    if (!userId) return
    await supabase.from('addresses').delete().eq('id', id)
    await loadAddresses(userId)
  }

  async function handleSetDefault(id: string) {
    if (!userId) return
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    await loadAddresses(userId)
  }

  if (loading) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/mypage" className="text-ink-muted hover:text-ink text-sm">← 마이페이지</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-brand text-2xl font-bold text-ink">배송지 관리</h1>
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM) }}
          className="flex items-center gap-1.5 text-sm text-white bg-surface-dark px-4 py-2 rounded-full hover:bg-surface-hover transition"
        >
          <Plus size={14} />
          배송지 추가
        </button>
      </div>

      {/* 주소 목록 */}
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-12 text-ink-muted bg-surface-muted rounded-xl">
          <p className="mb-2">저장된 배송지가 없습니다.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-ink underline"
          >
            배송지 추가하기
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {addresses.map((addr) => (
          <div key={addr.id} className={`bg-white border rounded-xl p-4 ${addr.is_default ? 'border-ink-sub' : 'border-line'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-ink-sub bg-surface-muted px-2 py-0.5 rounded-full">
                    {addr.label}
                  </span>
                  {addr.is_default && (
                    <span className="text-xs font-semibold text-white bg-surface-dark px-2 py-0.5 rounded-full">
                      기본
                    </span>
                  )}
                </div>
                <p className="font-medium text-ink text-sm">{addr.recipient_name}</p>
                <p className="text-sm text-ink-sub">{addr.phone}</p>
                <p className="text-sm text-ink-sub">{addr.address}</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    title="기본 배송지로 설정"
                    className="text-ink-faint hover:text-ink transition"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-ink-faint hover:text-red-400 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 추가 폼 */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-surface-muted rounded-xl p-5 flex flex-col gap-3">
          <h2 className="font-semibold text-ink mb-1">새 배송지</h2>

          {/* 라벨 */}
          <div className="flex gap-2">
            {LABELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setForm((f) => ({ ...f, label: l }))}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  form.label === l
                    ? 'border-ink bg-surface-dark text-white'
                    : 'border-line bg-white text-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="받는 분 이름 *"
            value={form.recipient_name}
            onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-ink"
            required
          />
          <input
            type="tel"
            placeholder="연락처 *"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-ink"
            required
          />
          <input
            type="text"
            placeholder="주소 (우편번호 포함) *"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-ink"
            required
          />
          <label className="flex items-center gap-2 text-sm text-ink-sub cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              className="rounded"
            />
            기본 배송지로 설정
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError('') }}
              className="flex-1 border border-line bg-white text-ink-sub font-medium py-3 rounded-xl text-sm hover:bg-surface transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-surface-dark text-white font-bold py-3 rounded-xl text-sm hover:bg-surface-hover transition disabled:opacity-60"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
