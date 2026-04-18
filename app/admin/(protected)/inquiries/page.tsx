import { createClient } from '@/lib/supabase/server'
import InquiryStatusButton from '@/components/admin/InquiryStatusButton'

export default async function AdminInquiriesPage() {
  const supabase = await createClient()
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*, products(name, slug)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-ink mb-8 tracking-tight">문의 관리</h1>

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
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-ink-muted py-24 text-sm">접수된 문의가 없습니다.</p>
      )}
    </div>
  )
}
