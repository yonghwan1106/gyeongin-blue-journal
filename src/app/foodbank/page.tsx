import type { Metadata } from 'next'
import { Heart, Package, Users, Clock, MapPin, Phone, Mail, HandHeart, Truck, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: '푸드뱅크 - 경인블루저널',
  description: '경인교회 푸드뱅크 - 나눔으로 따뜻한 세상을 만들어갑니다. 식품 기부, 수혜 안내, 자원봉사 참여 정보를 확인하세요.',
}

export default function FoodbankPage() {
  return (
    <div className="pt-0">
      {/* 히어로 섹션 */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Heart className="w-5 h-5 text-red-300" />
            <span className="text-sm font-medium">Food Bank</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            경인교회 푸드뱅크
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            나눔으로 따뜻한 세상을 만들어갑니다.<br />
            여러분의 작은 나눔이 이웃에게 큰 희망이 됩니다.
          </p>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">About</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">푸드뱅크란?</h2>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-secondary leading-relaxed mb-4">
                푸드뱅크는 식품 제조업체, 개인, 단체 등에서 기부한 여유 식품을 모아
                저소득 가정, 독거노인, 한부모 가족 등 도움이 필요한 이웃에게 전달하는
                식품 나눔 사업입니다.
              </p>
              <p className="text-secondary leading-relaxed">
                경인교회 푸드뱅크는 지역사회의 식품 불균형을 해소하고,
                어려운 이웃들이 건강한 식생활을 영위할 수 있도록
                사랑의 다리 역할을 하고 있습니다.
              </p>
            </div>
            <div className="bg-muted rounded-2xl p-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                운영 취지
              </h3>
              <ul className="space-y-3 text-secondary">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>식품 나눔을 통한 지역사회 사랑 실천</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>취약계층 식품 접근성 향상</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>식품 낭비 줄이기와 자원 선순환</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>나눔 문화 확산 및 공동체 의식 고양</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 운영 안내 섹션 */}
      <section className="py-16 bg-muted">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">How It Works</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">이렇게 운영됩니다</h2>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 단계 1 */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold mb-4">1</div>
              <h3 className="font-bold text-lg mb-3">기부 접수</h3>
              <p className="text-secondary text-sm leading-relaxed">
                개인, 기업, 단체로부터 식품 기부를 접수합니다.
                유통기한이 충분히 남은 안전한 식품을 기부받습니다.
              </p>
            </div>
            {/* 단계 2 */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold mb-4">2</div>
              <h3 className="font-bold text-lg mb-3">분류 및 검수</h3>
              <p className="text-secondary text-sm leading-relaxed">
                기부받은 식품의 유통기한, 상태를 꼼꼼히 확인하고
                종류별로 분류하여 안전하게 보관합니다.
              </p>
            </div>
            {/* 단계 3 */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold mb-4">3</div>
              <h3 className="font-bold text-lg mb-3">나눔 배분</h3>
              <p className="text-secondary text-sm leading-relaxed">
                도움이 필요한 이웃에게 식품을 전달합니다.
                정기적인 배분과 긴급 지원을 함께 운영합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 기부 안내 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">Donate</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">기부 안내</h2>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                기부 가능 품목
              </h3>
              <div className="space-y-3">
                {[
                  { label: '가공식품', desc: '라면, 통조림, 즉석밥, 과자, 음료 등' },
                  { label: '주식류', desc: '쌀, 밀가루, 식용유 등' },
                  { label: '조미료', desc: '간장, 된장, 고추장, 소금, 설탕 등' },
                  { label: '신선식품', desc: '채소, 과일 등 (당일 배분 가능 시)' },
                  { label: '생활용품', desc: '세제, 치약, 비누 등 생필품' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">{item.label}</span>
                      <p className="text-secondary text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-primary" />
                기부 방법
              </h3>
              <div className="bg-muted rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                  <div>
                    <p className="font-medium">직접 방문</p>
                    <p className="text-secondary text-sm">운영시간 내 푸드뱅크에 직접 방문하여 기부</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                  <div>
                    <p className="font-medium">전화 예약</p>
                    <p className="text-secondary text-sm">사전 전화 후 방문 일시 조율</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                  <div>
                    <p className="font-medium">수거 요청</p>
                    <p className="text-secondary text-sm">대량 기부 시 직접 수거 가능 (사전 협의)</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 border border-border rounded-xl text-sm text-secondary">
                <strong className="text-foreground">유의사항:</strong> 유통기한이 1개월 이상 남은 식품만 기부 가능합니다.
                개봉된 식품, 변질된 식품은 접수가 어렵습니다.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 수혜 안내 섹션 */}
      <section className="py-16 bg-muted">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">Support</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">수혜 안내</h2>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                지원 대상
              </h3>
              <ul className="space-y-3 text-secondary">
                {[
                  '기초생활수급자',
                  '차상위계층 가정',
                  '독거노인',
                  '한부모 가족',
                  '긴급 복지 대상자',
                  '기타 도움이 필요한 이웃',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-primary" />
                신청 방법
              </h3>
              <div className="space-y-4 text-secondary">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</div>
                  <div>
                    <p className="font-medium text-foreground">상담 신청</p>
                    <p className="text-sm">전화 또는 방문으로 상담을 신청합니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</div>
                  <div>
                    <p className="font-medium text-foreground">서류 제출</p>
                    <p className="text-sm">수급자 증명서 등 관련 서류를 제출합니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">3</div>
                  <div>
                    <p className="font-medium text-foreground">심사 및 등록</p>
                    <p className="text-sm">심사 후 정기 수혜자로 등록됩니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">4</div>
                  <div>
                    <p className="font-medium text-foreground">식품 수령</p>
                    <p className="text-sm">정기 배분일에 식품을 수령합니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 자원봉사 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">Volunteer</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">자원봉사 안내</h2>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="font-bold text-xl mb-6">함께하는 봉사활동</h3>
                <div className="space-y-4">
                  {[
                    { title: '식품 분류 및 포장', desc: '기부 식품 검수, 분류, 포장 작업' },
                    { title: '배분 보조', desc: '식품 배분일 현장 지원 및 안내' },
                    { title: '수거 지원', desc: '기부 식품 수거 및 운반 보조' },
                    { title: '행정 지원', desc: '재고 관리, 데이터 입력 등 사무 보조' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-secondary text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-6">참여 방법</h3>
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <p className="text-secondary leading-relaxed">
                    누구나 자원봉사에 참여할 수 있습니다.
                    개인, 단체, 기업 봉사 모두 환영합니다.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-secondary">전화로 봉사 일정을 문의하세요</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-secondary">단체 봉사는 사전 예약이 필요합니다</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-secondary">봉사 시간: 1365 자원봉사 인증 가능</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 운영 정보 섹션 */}
      <section className="py-16 bg-muted">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">Info</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">운영 정보</h2>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3">운영시간</h3>
              <div className="text-secondary text-sm space-y-1">
                <p>평일: 오전 9:00 ~ 오후 6:00</p>
                <p>토요일: 오전 9:00 ~ 오후 1:00</p>
                <p className="text-accent font-medium">일요일 및 공휴일 휴무</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3">오시는 길</h3>
              <div className="text-secondary text-sm space-y-1">
                <p>경기도 OO시 OO구</p>
                <p>OO로 123번길 45</p>
                <p>경인교회 지하 1층</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3">연락처</h3>
              <div className="text-secondary text-sm space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>031-000-0000</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>foodbank@gyeongin.church</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-secondary">
            <p>* 운영시간, 장소, 연락처는 변경될 수 있습니다. 방문 전 전화 확인을 권장합니다.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
