'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveInquiryReply } from '@/app/admin/(protected)/inquiries/actions'

interface Props {
  inquiryId: string
  initialReply: string | null
  repliedAt: string | null
}

export default function InquiryReplyForm({ inquiryId, initialReply, repliedAt }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(!initialReply)
  const [value, setValue] = useState(initialReply ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await saveInquiryReply(inquiryId, value)
      setEditing(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setValue(initialReply ?? '')
    setEditing(false)
  }

  if (!editing && initialReply) {
    return (
      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-green-700">관리자 답변</span>
          <div className="flex items-center gap-3">
            {repliedAt && (
              <span className="text-xs text-ink-faint">
                {new Date(repliedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-ink-muted hover:text-ink transition"
            >
              수정
            </button>
          </div>
        </div>
        <p className="text-sm text-ink leading-relaxed bg-green-50 rounded-xl p-3 whitespace-pre-wrap">
          {initialReply}
        </p>
      </div>
    )
  }

  if (!editing && !initialReply) {
    return (
      <div className="mt-4 border-t border-line pt-4">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-ink-muted hover:text-ink transition"
        >
          + 답변 작성
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="text-xs font-semibold text-ink mb-2">
        {initialReply ? '답변 수정' : '답변 작성'}
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="고객에게 전달할 답변을 입력하세요"
        className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink resize-none"
        autoFocus
      />
      <div className="flex justify-end gap-2 mt-2">
        {initialReply && (
          <button
            onClick={handleCancel}
            className="text-xs px-4 py-2 rounded-lg border border-line text-ink-sub hover:bg-surface transition"
          >
            취소
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs px-4 py-2 rounded-lg bg-surface-dark text-white font-medium hover:bg-surface-hover transition disabled:opacity-60"
        >
          {saving ? '저장 중...' : '답변 저장'}
        </button>
      </div>
    </div>
  )
}
