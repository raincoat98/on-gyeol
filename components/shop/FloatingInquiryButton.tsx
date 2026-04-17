'use client'

import { Phone, MessageCircle } from 'lucide-react'

export default function FloatingInquiryButton() {
  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3">
      {/* 카카오 문의 */}
      <a
        href="https://pf.kakao.com/_your_kakao_id"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#FEE500] text-[#3A1D1D] font-semibold px-4 py-3 rounded-full shadow-lg text-sm whitespace-nowrap"
        aria-label="카카오톡 문의"
      >
        <MessageCircle size={20} />
        카카오 문의
      </a>
      {/* 전화 문의 */}
      <a
        href="tel:01000000000"
        className="flex items-center gap-2 bg-[#5C4A2A] text-white font-semibold px-4 py-3 rounded-full shadow-lg text-sm whitespace-nowrap"
        aria-label="전화 문의"
      >
        <Phone size={20} />
        전화 문의
      </a>
    </div>
  )
}
