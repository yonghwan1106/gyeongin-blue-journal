import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/common/ScrollToTop'

export const metadata: Metadata = {
  title: '경인블루저널 - 경인 지역 뉴스',
  description: '경인 지역의 정치, 경제, 사회, 문화 소식을 빠르고 정확하게 전달하는 인터넷 신문',
  keywords: '경인블루저널, 경기뉴스, 인천뉴스, 경인지역, 지역뉴스',
  openGraph: {
    title: '경인블루저널 - 경인 지역 뉴스',
    description: '경인 지역의 정치, 경제, 사회, 문화 소식을 빠르고 정확하게 전달하는 인터넷 신문',
    type: 'website',
    locale: 'ko_KR',
    siteName: '경인블루저널',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2"
        >
          본문 바로가기
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  )
}
