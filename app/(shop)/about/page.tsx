import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '브랜드 소개 | 온결',
  description: '마음의 결을 담은 옷, 온결의 이야기입니다.',
}

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F4]">
      {/* 히어로 */}
      <section className="relative -mt-16 h-[50vh] min-h-[360px] flex items-end justify-center overflow-hidden bg-[#E8DFD0]">
        <Image
          src="/hero.jpg"
          alt="온결"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center pb-16 px-4">
          <p className="text-xs text-white/60 tracking-[0.4em] mb-3 uppercase">Our Story</p>
          <h1 className="font-brand text-4xl md:text-5xl font-bold text-white tracking-widest">
            온결의 이야기
          </h1>
        </div>
      </section>

      {/* 브랜드 철학 */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-xs tracking-[0.3em] text-[#9C9189] mb-4 uppercase">Philosophy</p>
        <h2 className="font-brand text-3xl font-bold text-[#5C4A2A] mb-6">마음의 결을 담은 옷</h2>
        <div className="w-8 h-px bg-[#C5BDB5] mx-auto mb-8" />
        <p className="text-[#8B6F47] leading-loose text-base">
          온결은 부부가 함께 만든 작은 쇼핑몰입니다.<br />
          좋은 옷을 고르는 눈, 따뜻한 마음을 담아<br />
          일상을 더 편안하고 아름답게 만들어 드리고 싶습니다.
        </p>
      </section>

      {/* 구분선 */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="border-t border-[#E8DFD0]" />
      </div>

      {/* 가치 3가지 */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-xs tracking-[0.3em] text-[#9C9189] mb-12 uppercase text-center">Our Values</p>
        <div className="grid md:grid-cols-3 gap-12 text-center">
          {[
            {
              title: '편안함',
              desc: '몸이 편해야 마음도 편합니다.\n하루 종일 입어도 부담 없는\n소재와 핏을 고집합니다.',
            },
            {
              title: '정직한 가격',
              desc: '좋은 옷이 비쌀 필요는 없습니다.\n합리적인 가격으로\n품질을 타협하지 않습니다.',
            },
            {
              title: '진심',
              desc: '내 가족이 입을 옷을 고르는 마음으로\n한 벌 한 벌\n직접 선별합니다.',
            },
          ].map((v) => (
            <div key={v.title}>
              <div className="w-10 h-px bg-[#C5BDB5] mx-auto mb-6" />
              <h3 className="font-brand text-xl font-bold text-[#5C4A2A] mb-4">{v.title}</h3>
              <p className="text-sm text-[#8B6F47] leading-loose whitespace-pre-line">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 구분선 */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="border-t border-[#E8DFD0]" />
      </div>

      {/* 브랜드명 의미 */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-xs tracking-[0.3em] text-[#9C9189] mb-4 uppercase">Brand Name</p>
        <h2 className="font-brand text-3xl font-bold text-[#5C4A2A] mb-6">온결이란?</h2>
        <div className="w-8 h-px bg-[#C5BDB5] mx-auto mb-8" />
        <p className="text-[#8B6F47] leading-loose text-base">
          <span className="font-semibold text-[#5C4A2A]">온</span>은 따뜻함을,{' '}
          <span className="font-semibold text-[#5C4A2A]">결</span>은 마음의 결을 뜻합니다.<br />
          따뜻한 마음의 결이 담긴 옷—<br />
          그것이 온결이 추구하는 가치입니다.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-[#E8DFD0] py-16 text-center">
        <h2 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-3">온결의 옷을 만나보세요</h2>
        <p className="text-sm text-[#8B6F47] mb-8">정성껏 고른 데일리룩이 기다리고 있습니다.</p>
        <Link
          href="/products"
          className="inline-block border border-[#5C4A2A] text-[#5C4A2A] text-sm font-medium tracking-widest px-10 py-3.5 hover:bg-[#5C4A2A] hover:text-white transition-colors duration-300"
        >
          SHOP NOW
        </Link>
      </section>
    </div>
  )
}
