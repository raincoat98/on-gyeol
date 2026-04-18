'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Pencil, X, Check, Clock } from 'lucide-react'

type Log = {
  id: string
  action: string
  detail: string | null
  created_at: string
}

type Props = {
  orderId: string
  orderNumber: string
  name: string
  phone: string
  address: string
  memo: string | null
  logs: Log[]
}

export default function OrderDeliveryEditor({
  orderId, orderNumber, name, phone, address, memo, logs: initialLogs,
}: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name, phone, address, memo: memo ?? '' })
  const [logs, setLogs] = useState(initialLogs)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    // 변경 항목 파악
    const changes: string[] = []
    if (form.name !== name) changes.push(`이름: ${name} → ${form.name}`)
    if (form.phone !== phone) changes.push(`연락처: ${phone} → ${form.phone}`)
    if (form.address !== address) changes.push(`주소: ${address} → ${form.address}`)
    if (form.memo !== (memo ?? '')) changes.push(`메모: ${memo ?? '없음'} → ${form.memo || '없음'}`)

    if (changes.length === 0) { setEditing(false); setSaving(false); return }

    // 배송정보 업데이트
    await supabase.from('orders').update({
      customer_name: form.name,
      customer_phone: form.phone,
      customer_address: form.address,
      customer_memo: form.memo || null,
    }).eq('id', orderId)

    // 로그 기록
    const { data: log } = await supabase.from('order_logs').insert({
      order_id: orderId,
      action: '배송정보 수정',
      detail: changes.join('\n'),
    }).select().single()

    if (log) setLogs([log as Log, ...logs])

    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="mt-3 border-t border-[#F3EDE4] pt-3">
      {!editing ? (
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs text-[#6B6B6B] space-y-0.5">
            <p><span className="text-[#9C9189]">수령인</span> {name} · {phone}</p>
            <p><span className="text-[#9C9189]">주소</span> {address}</p>
            {memo && <p><span className="text-[#9C9189]">메모</span> {memo}</p>}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-[#9C9189] hover:text-[#1C1C1E] transition shrink-0"
          >
            <Pencil size={12} /> 수정
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="수령인"
              className="border border-[#E8DFD0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1C1C1E]"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="연락처"
              className="border border-[#E8DFD0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1C1C1E]"
            />
          </div>
          <input
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="주소"
            className="border border-[#E8DFD0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1C1C1E]"
          />
          <input
            value={form.memo}
            onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
            placeholder="메모 (선택)"
            className="border border-[#E8DFD0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1C1C1E]"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setEditing(false); setForm({ name, phone, address, memo: memo ?? '' }) }}
              className="flex items-center gap-1 text-xs text-[#9C9189] hover:text-[#1C1C1E] px-3 py-1.5 border border-[#E8DFD0] rounded-lg transition"
            >
              <X size={12} /> 취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs text-white bg-[#1C1C1E] hover:bg-[#3A3A3C] px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              <Check size={12} /> {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}

      {/* 변경 로그 */}
      {logs.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowLogs((v) => !v)}
            className="flex items-center gap-1 text-xs text-[#9C9189] hover:text-[#1C1C1E] transition"
          >
            <Clock size={11} />
            변경 이력 {logs.length}건
            {showLogs ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showLogs && (
            <div className="mt-2 flex flex-col gap-1.5 pl-3 border-l-2 border-[#F3EDE4]">
              {logs.map((log) => (
                <div key={log.id}>
                  <p className="text-xs text-[#9C9189]">
                    {new Date(log.created_at).toLocaleDateString('ko-KR', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })} · {log.action}
                  </p>
                  {log.detail && (
                    <p className="text-xs text-[#6B6B6B] whitespace-pre-line mt-0.5">{log.detail}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
