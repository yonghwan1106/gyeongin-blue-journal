'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()

  // 관리자 페이지에서는 푸터 숨김
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">경</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">경인블루저널</h2>
                <p className="text-xs text-slate-400">Gyeongin Blue Journal</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              경인 지역의 정치, 경제, 사회, 문화 소식을 빠르고 정확하게 전달하는
              인터넷 신문사입니다. 지역 주민의 목소리를 대변하고,
              건전한 여론 형성에 기여합니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">빠른 링크</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/category/politics" className="hover:text-white transition-colors">
                  정치
                </Link>
              </li>
              <li>
                <Link href="/category/economy" className="hover:text-white transition-colors">
                  경제
                </Link>
              </li>
              <li>
                <Link href="/category/society" className="hover:text-white transition-colors">
                  사회
                </Link>
              </li>
              <li>
                <Link href="/category/culture" className="hover:text-white transition-colors">
                  문화
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">연락처</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@bluejournal.kr" className="hover:text-white transition-colors">
                  contact@bluejournal.kr
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>02-1234-5678</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>경기도 수원시 영통구<br />광교로 123, 4층</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/about" className="hover:text-white transition-colors">
                회사소개
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                이용약관
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                광고문의
              </Link>
            </div>
            <p>© {new Date().getFullYear()} 경인블루저널. All rights reserved.</p>
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">
            <p>등록번호: 경기, 아12345 | 등록일: 2026년 1월 1일 | 발행인·편집인: 홍길동</p>
            <p>청소년보호책임자: 김철수</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
