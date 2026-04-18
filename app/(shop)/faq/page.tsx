import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '자주 묻는 질문',
  description: '온결 자주 묻는 질문 - 배송, 교환, 환불 안내',
}

const FAQ = [
  {
    q: '배송은 얼마나 걸리나요?',
    a: '주문 확인 후 1~3 영업일 내 발송되며, 발송 후 1~2일 이내 도착합니다. (주말·공휴일 제외)',
  },
  {
    q: '배송비는 얼마인가요?',
    a: '기본 배송비는 3,000원이며, 5만원 이상 구매 시 무료 배송입니다.',
  },
  {
    q: '교환·환불은 어떻게 하나요?',
    a: '수령 후 7일 이내 전화 또는 카카오톡으로 문의해 주세요. 상품 불량 및 오배송의 경우 전액 환불 가능합니다.',
  },
  {
    q: '세탁 방법이 궁금해요.',
    a: '상품별 세탁 라벨을 확인해 주세요. 대부분 손세탁 또는 드라이클리닝을 권장합니다.',
  },
  {
    q: '사이즈 선택이 어려워요.',
    a: '전화(010-0000-0000) 또는 카카오톡으로 문의주시면 맞는 사이즈를 안내해 드립니다.',
  },
  {
    q: '품절 상품은 재입고 되나요?',
    a: '인기 상품은 재입고될 수 있습니다. 재입고 문의는 카카오톡 또는 전화로 남겨주시면 우선 안내해 드립니다.',
  },
]

export default function FaqPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-8">자주 묻는 질문</h1>
      <div className="flex flex-col gap-4">
        {FAQ.map((item, i) => (
          <details
            key={i}
            className="bg-white border border-[#E5E5EA] rounded-xl overflow-hidden group"
          >
            <summary className="px-5 py-4 font-medium text-[#2D2416] cursor-pointer list-none flex justify-between items-center">
              <span>Q. {item.q}</span>
              <span className="text-[#9C9189] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-5 pb-5 text-sm text-[#8B6F47] leading-relaxed border-t border-[#E5E5EA] pt-4">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
