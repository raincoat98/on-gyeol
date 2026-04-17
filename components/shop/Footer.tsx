import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#E8DFD0] text-[#5C4A2A]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-brand text-xl font-bold tracking-widest mb-2">온결</p>
            <p className="text-sm text-[#9C9189]">마음의 결을 담은 옷</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-semibold mb-1">고객센터</p>
              <a href="tel:01000000000" className="hover:underline">010-0000-0000</a>
              <p className="text-[#9C9189]">평일 10:00 – 17:00</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-semibold mb-1">안내</p>
              <Link href="/about" className="hover:underline">브랜드 소개</Link>
              <Link href="/faq" className="hover:underline">자주 묻는 질문</Link>
              <Link href="/contact" className="hover:underline">문의하기</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#D4C9B8] text-xs text-[#9C9189] flex flex-col gap-1">
          <p>상호명: 온결 | 대표: 홍길동 | 사업자등록번호: 000-00-00000</p>
          <p>통신판매업신고번호: 제2024-서울-00000호 | 주소: 서울특별시 강남구</p>
          <p className="mt-2">© 2024 온결. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
