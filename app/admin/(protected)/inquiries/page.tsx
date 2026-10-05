import { apiFetch } from '@/lib/api/server'
import InquiryStatusButton from '@/components/admin/InquiryStatusButton'
import InquiryReplyForm from '@/components/admin/InquiryReplyForm'
import RefreshButton from '@/components/admin/RefreshButton'
import type { Inquiry, InquiryStatus } from '@/types'

const STATUS_LABELS = {
  pending: '미답변',
  replied: '답변완료',
  closed: '종료',
} as const

type InquiryStatusKey = keyof typeof STATUS_LABELS

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams

  const [countMap, inquiries] = await Promise.all([
    apiFetch<Record<InquiryStatus, number>>('/inquiries/counts'),
    apiFetch<Inquiry[]>(`/inquiries?limit=100${params.status ? `&status=${params.status}` : ''}`),
  ])

  const totalCount = Object.values(countMap).reduce((sum, n) => sum + n, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-ink tracking-tight">문의 관리</h1>
        <RefreshButton />
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <a
          href="/admin/inquiries"
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            !params.status ? 'bg-surface-dark text-white border-ink' : 'border-line text-ink-muted hover:border-ink hover:text-ink'
          }`}
        >
          전체 ({totalCount})
        </a>
        {(Object.entries(STATUS_LABELS) as [InquiryStatusKey, string][]).map(([v, label]) => (
          <a
            key={v}
            href={`?status=${v}`}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              params.status === v ? 'bg-surface-dark text-white border-ink' : 'border-line text-ink-muted hover:border-ink hover:text-ink'
            }`}
          >
            {label} ({countMap[v] ?? 0})
          </a>
        ))}
      </div>

      {inquiries && inquiries.length > 0 ? (
        <div className="flex flex-col gap-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-white border border-line rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-ink text-sm">{inq.customer_name}</p>
                  <a href={`tel:${inq.phone}`} className="text-xs text-ink-muted hover:text-ink transition">
                    {inq.phone}
                  </a>
                </div>
                <InquiryStatusButton inquiryId={inq.id} currentStatus={inq.status} />
              </div>
              {inq.products && (
                <p className="text-xs text-ink-muted mb-2">
                  상품: {(inq.products as { name: string })?.name}
                </p>
              )}
              <p className="text-sm text-ink leading-relaxed bg-surface rounded-xl p-3">
                {inq.message}
              </p>
              <p className="text-xs text-ink-faint mt-2 text-right">
                {new Date(inq.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              <InquiryReplyForm
                inquiryId={inq.id}
                initialReply={inq.admin_reply ?? null}
                repliedAt={inq.replied_at ?? null}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-ink-muted py-24 text-sm">
          {params.status ? `${STATUS_LABELS[params.status as InquiryStatusKey]} 문의가 없습니다.` : '접수된 문의가 없습니다.'}
        </p>
      )}
    </div>
  )
}
