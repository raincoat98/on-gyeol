import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '온결 | 따뜻하고 편안한 데일리룩',
    template: '%s | 온결',
  },
  description: '마음의 결을 담은 옷, 온결. 부부의 안목으로 고른 따뜻하고 편안한 3060 여성 데일리룩.',
  keywords: ['온결', '여성의류', '중년여성의류', '데일리룩', '편안한옷', '3060패션'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '온결',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F4] text-[#2D2416]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
