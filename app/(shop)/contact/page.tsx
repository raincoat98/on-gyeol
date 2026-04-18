import type { Metadata } from 'next'
import InquiryForm from '@/components/shop/InquiryForm'

export const metadata: Metadata = {
  title: '문의하기',
  description: '온결에 문의하세요. 빠르게 답변드립니다.',
}

export default function ContactPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="font-brand text-2xl font-bold text-ink mb-2">문의하기</h1>
      <p className="text-sm text-ink-muted mb-8">궁금하신 점을 남겨주시면 빠르게 연락드립니다.</p>

      <div className="flex flex-col gap-4 bg-white border border-line rounded-xl p-5 mb-8 text-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg">📞</span>
          <div>
            <p className="font-semibold text-ink">전화 문의</p>
            <a href="tel:01000000000" className="text-ink-sub">010-0000-0000</a>
            <p className="text-ink-muted text-xs">평일 10:00 – 17:00</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg">💬</span>
          <div>
            <p className="font-semibold text-ink">카카오톡 문의</p>
            <a href="https://pf.kakao.com/_your_kakao_id" className="text-ink-sub">카카오채널 바로가기</a>
          </div>
        </div>
      </div>

      <InquiryForm productId="" productName="" />
    </div>
  )
}
