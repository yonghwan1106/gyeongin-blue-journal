# 경인블루저널 프로젝트 가이드

## 프로젝트 개요
- **프로젝트명**: 경인블루저널 (Gyeongin Blue Journal)
- **위치**: `C:\Users\user\projects\2026_active\gyeongin-blue-journal`
- **기술 스택**: Next.js 14 (App Router) + PocketBase + Tailwind CSS
- **배포**: Vercel (https://gyeongin-blue-journal.vercel.app/)
- **PocketBase**: http://158.247.210.200:8090

---

## 기사 관리 가이드

### PocketBase 카테고리 ID
| 카테고리 | ID | slug |
|---------|-----|------|
| 정치 | mq8899s58bf0699 | politics |
| 경제 | k9r3229a8774k70 | economy |
| 사회 | 05q79x0comk524d | society |
| 문화 | 150tdl8949xydgm | culture |
| 스포츠 | 2se1eh4n9pdfsc5 | sports |
| IT/과학 | 575wm01lh7c29c6 | it |
| 오피니언 | vd5u5e5a411ighp | opinion |

### PocketBase 지역(regions) 컬렉션
지역별 필터링은 기사의 `tags` 필드에 지역명이 포함되어 있으면 자동으로 연결됩니다.

| 지역 | ID | slug | type |
|------|-----|------|------|
| 경기도 | vf6a8hy5jje9l05 | gyeonggi | province |
| 인천시 | 1u5vz121626vk85 | incheon | metro |
| 수원시 | 29y13784huvkh7e | suwon | city |
| 성남시 | g76xghc68jd92j9 | seongnam | city |
| 용인시 | pin2148g1bogr0p | yongin | city |
| 고양시 | co6gwa21nmrts6h | goyang | city |
| 화성시 | 2m40d0w5kk6fpv6 | hwaseong | city |
| 부천시 | b5o8p2bxd28gix2 | bucheon | city |
| 안산시 | y1wdi7x3x6h1e67 | ansan | city |
| 안양시 | ibco65d89hwx1q2 | anyang | city |
| 남양주시 | o7vyu6274j676k3 | namyangju | city |
| 평택시 | c108tz60u445akq | pyeongtaek | city |
| 의정부시 | 9o86i96asjeylnj | uijeongbu | city |
| 시흥시 | 1i0m7f6umw365g2 | siheung | city |
| 파주시 | eu34440285v1xcr | paju | city |
| 광명시 | 08003p2t0bv1v2w | gwangmyeong | city |
| 김포시 | 9lik64se0w1kg9j | gimpo | city |
| 군포시 | 0a3a8h6cc4eo6y0 | gunpo | city |
| 광주시 | fgh19cuh0s8z3gd | gwangju-gg | city |
| 이천시 | g5j0qq5mie889fq | icheon | city |
| 양주시 | 66bt887p6ra0414 | yangju | city |
| 오산시 | 011s8r51is5dn25 | osan | city |
| 구리시 | xa9kz9d9wu6r2l5 | guri | city |
| 안성시 | 31903q12xzmxufb | anseong | city |
| 포천시 | 5c07y47jcwfo930 | pocheon | city |
| 의왕시 | 4t1d5hv6g2c564z | uiwang | city |
| 하남시 | e59300mpj705h36 | hanam | city |
| 여주시 | kl908c5su6o54xr | yeoju | city |
| 동두천시 | 41x2i0see2v799s | dongducheon | city |
| 과천시 | 91184aoik63pa3u | gwacheon | city |
| 양평군 | l8nlltti0u0h291 | yangpyeong | county |
| 가평군 | 78o2603hmjce64e | gapyeong | county |
| 연천군 | 5z024hz3079y9df | yeoncheon | county |

### 기사 추가 방법

#### 1. 기사 레코드 생성
```
mcp__pocketbase-mcp__create_record 사용:
- collection: "articles"
- data: {
    "title": "기사 제목",
    "slug": "article-slug-in-english",
    "summary": "기사 요약 (150자 이내)",
    "content": "<p>HTML 형식의 본문</p>",
    "category": "카테고리 ID",
    "status": "published",
    "is_headline": false,
    "is_breaking": false,
    "views": 0,
    "tags": ["태그1", "태그2"],
    "published_at": "2026-01-30T09:00:00Z"
  }
```

#### 2. 썸네일 이미지 업로드
```
mcp__pocketbase-mcp__upload_file_from_url 사용:
- collection: "articles"
- recordId: "생성된 기사 ID"
- fileField: "thumbnail"
- url: "이미지 URL"
- fileName: "파일명.jpg"
```

### 기사 추가 시 주의사항
1. **사진 필수**: 썸네일 이미지가 없는 기사는 절대 추가하지 않음 (이미지 깨짐 방지)
2. **slug 형식**: 영문 kebab-case (예: `gyeonggi-youth-policy-2026`)
3. **헤드라인 설정**: 중요 기사는 `is_headline: true`로 설정
4. **속보 설정**: 긴급 뉴스는 `is_breaking: true`로 설정
5. **태그 규칙**: 지역명은 "시/군/도" 없이 추가 (예: "용인", "수원", "인천")

### 지역별 기사 현황 (2026-01-30 업데이트)

**총 기사 수: 205개** (모든 지역 커버 완료)

| 지역 | 기사 수 | 상태 |
|------|---------|------|
| 경기도 | 15개 | ✅ |
| 수원시 | 10개 | ✅ |
| 용인시 | 10개 | ✅ |
| 고양시 | 10개 | ✅ |
| 화성시 | 10개 | ✅ |
| 성남시 | 9개 | ✅ |
| 인천시 | 5개 | ✅ |
| 부천시 | 5개 | ✅ |
| 안산시 | 5개 | ✅ |
| 안양시 | 5개 | ✅ |
| 남양주시 | 5개 | ✅ |
| 평택시 | 5개 | ✅ |
| 의정부시 | 5개 | ✅ |
| 시흥시 | 5개 | ✅ |
| 파주시 | 5개 | ✅ |
| 광명시 | 5개 | ✅ |
| 김포시 | 1개 | ⚠️ |
| 군포시 | 5개 | ✅ |
| 광주시 | 5개 | ✅ |
| 이천시 | 5개 | ✅ |
| 양주시 | 5개 | ✅ |
| 오산시 | 5개 | ✅ |
| 구리시 | 5개 | ✅ |
| 안성시 | 5개 | ✅ |
| 포천시 | 5개 | ✅ |
| 의왕시 | 5개 | ✅ |
| 하남시 | 5개 | ✅ |
| 여주시 | 5개 | ✅ |
| 동두천시 | 5개 | ✅ |
| 과천시 | 5개 | ✅ |
| 양평군 | 5개 | ✅ |
| 가평군 | 5개 | ✅ |
| 연천군 | 5개 | ✅ |

### 기사 삭제 방법
```
mcp__pocketbase-mcp__delete_record 사용:
- collection: "articles"
- id: "삭제할 기사 ID"
```

### 기사 목록 조회
```
mcp__pocketbase-mcp__list_records 사용:
- collection: "articles"
- fields: "id,title,thumbnail,status"
- sort: "-created"
```

---

## 보도자료 소스 (2026-01-30 확인 완료)

### 경기도 31개 시군 + 인천시 보도자료 직접 URL

> 모든 URL은 2026-01-30 기준 Playwright로 직접 확인됨

#### 특례시/대도시 (6개)
| 지자체 | 보도자료 페이지 URL |
|--------|---------------------|
| 수원시 | https://www.suwon.go.kr/web/board/BD_board.list.do?bbsCd=1042 |
| 성남시 | https://www.seongnam.go.kr/city/1000052/30001/bbsList.do |
| 용인시 | https://www.yongin.go.kr/news/press/list.do |
| 고양시 | https://www.goyang.go.kr/www/www05/www0501/www050101.jsp |
| 화성시 | https://www.hscity.go.kr/www/selectBbsNttList.do?bbsNo=96&key=2871 |
| 부천시 | https://www.bucheon.go.kr/site/program/board/basicboard/list?boardtypeid=29 |

#### 중소도시 (22개)
| 지자체 | 보도자료 페이지 URL |
|--------|---------------------|
| 안산시 | https://www.ansan.go.kr/www/selectBbsNttList.do?bbsNo=594&key=3032 |
| 안양시 | https://www.anyang.go.kr/main/selectBbsNttList.do?bbsNo=73&key=256 |
| 남양주시 | https://www.nyj.go.kr/news/selectBbsNttList.do?bbsNo=1&key=2274 |
| 평택시 | https://www.pyeongtaek.go.kr/pyeongtaek/selectBbsNttList.do?bbsNo=8&key=1654 |
| 의정부시 | https://www.ui4u.go.kr/portal/bbs/list.do?ptIdx=49&mId=0301010000 |
| 시흥시 | https://www.siheung.go.kr/main/selectBbsNttList.do?bbsNo=117&key=649 |
| 파주시 | https://www.paju.go.kr/user/board/BD_board.list.do?bbsCd=1091&q_ctgCd=1001 |
| 광명시 | https://www.gm.go.kr/pt/selectBbsNttList.do?bbsNo=91&key=1448 |
| 김포시 | https://www.gimpo.go.kr/portal/selectBbsNttList.do?bbsNo=299&key=1499 |
| 군포시 | https://www.gunpo.go.kr/www/selectBbsNttList.do?bbsNo=685&key=3893 |
| 광주시 | https://www.gjcity.go.kr/portal/selectBbsNttList.do?bbsNo=88&key=1426 |
| 이천시 | https://www.icheon.go.kr/portal/selectBbsNttList.do?bbsNo=65&key=1516 |
| 양주시 | https://www.yangju.go.kr/www/selectBbsNttList.do?bbsNo=176&key=2082 |
| 오산시 | https://www.osan.go.kr/portal/contents.do?mId=0301080000 |
| 구리시 | https://www.guri.go.kr/cms/selectBbsNttList.do?bbsNo=96&key=498 |
| 안성시 | https://www.anseong.go.kr/portal/contents.do?mId=0502010000 |
| 포천시 | https://www.pocheon.go.kr/www/selectBbsNttList.do?bbsNo=243&key=3044 |
| 의왕시 | https://www.uiwang.go.kr/portal/selectBbsNttList.do?bbsNo=24&key=1277 |
| 하남시 | https://www.hanam.go.kr/www/selectBbsNttList.do?bbsNo=26&key=1428 |
| 여주시 | https://www.yeoju.go.kr/brd/board/895/L/menu/610 |
| 동두천시 | https://www.ddc.go.kr/ddc/selectBbsNttList.do?bbsNo=95&key=1914 |
| 과천시 | https://www.gccity.go.kr/portal/selectBbsNttList.do?bbsNo=23&key=1248 |

#### 군 지역 (3개)
| 지자체 | 보도자료 페이지 URL |
|--------|---------------------|
| 양평군 | https://www.yp21.go.kr/www/selectBbsNttList.do?bbsNo=2&key=1112 |
| 가평군 | https://www.gp.go.kr/portal/selectBbsNttList.do?bbsNo=72&key=2139 |
| 연천군 | https://www.yeoncheon.go.kr/portal/selectBbsNttList.do?bbsNo=107&key=1590 |

#### 광역시 (1개)
| 지자체 | 보도자료 페이지 URL |
|--------|---------------------|
| 인천시 | https://www.incheon.go.kr/IC010205 |

#### 경기도청
| 지자체 | 보도자료 페이지 URL |
|--------|---------------------|
| 경기도 | https://gnews.gg.go.kr/briefing/brief_gongbo_list.do |

---

## 일일 자동 업데이트 워크플로우

### Claude Code 사용 시 자동 기사 업데이트 명령

```
경인블루저널 일일 업데이트를 실행해줘.
각 지자체(경기도, 인천시 포함 32개 지자체) 보도자료를 확인해서
사진이 포함된 최신 기사를 각 2~3개씩 추가해줘.
```

### 업데이트 절차
1. **병렬 에이전트 실행**: 8개 지자체씩 병렬로 보도자료 검색
2. **기사 선별 기준**:
   - 사진 자료가 반드시 포함된 보도자료만 선택
   - 최근 24시간 이내 발표된 보도자료 우선
   - 지역 주민에게 유용한 정보 (복지, 행사, 정책 등)
3. **기사 생성**: PocketBase에 기사 레코드 생성 + 썸네일 업로드
4. **중복 방지**: 동일 slug 기사는 건너뜀

### 카테고리 매핑 가이드
| 보도자료 주제 | 카테고리 ID | slug |
|--------------|-------------|------|
| 선거, 의회, 정당, 정책 발표 | mq8899s58bf0699 | politics |
| 기업 유치, 일자리, 경제 지원 | k9r3229a8774k70 | economy |
| 복지, 안전, 교통, 환경, 교육 | 05q79x0comk524d | society |
| 축제, 문화재, 예술, 관광 | 150tdl8949xydgm | culture |
| 체육, 스포츠 대회, 시설 | 2se1eh4n9pdfsc5 | sports |
| 스마트시티, AI, 과학기술 | 575wm01lh7c29c6 | it |

### 권장 업데이트 일정
- **시간**: 매일 오전 9시 (보도자료 배포 후)
- **빈도**: 주 5회 (평일)
- **목표**: 일일 10~15개 신규 기사

---

## 자동화 스크립트 (GitHub Actions)

### 현재 상태 (2026-01-30)
- **위치**: `scripts/daily-update.mjs`
- **실행**: GitHub Actions (매일 오전 9시 KST)
- **방식**: 지자체 보도자료 직접 스크래핑 (저작권 안전)

### 지원 지자체
| 지자체 | 상태 | 비고 |
|--------|------|------|
| 수원시 | ✅ 작동 | jsView() onclick 패턴 |
| 인천시 | ⚠️ 조정 필요 | 카드형 레이아웃 |
| 화성시 | ⚠️ 조정 필요 | 수원시와 동일 CMS |
| 경기도 | ❌ URL 변경 | gnews.gg.go.kr |
| 고양시 | ⚠️ 조정 필요 | 셀렉터 확인 필요 |
| 성남시 | ❌ 접근 실패 | SSL/인증 문제 |
| 용인시 | ❌ 404 | URL 변경됨 |

### 스크립트 수동 실행
```bash
# GitHub Actions 수동 트리거
gh workflow run daily-update.yml

# 로컬 테스트 (Node.js 20+)
cd scripts && node daily-update.mjs
```

### 새 지자체 추가 방법
1. 보도자료 페이지 URL 확인
2. HTML 구조 분석 (테이블/카드/목록)
3. 셀렉터 설정 추가
4. onclick 패턴 또는 href 속성 확인
5. 테스트 후 커밋

### 기사 작성 워크플로우
1. 지자체 보도자료 페이지 방문 또는 웹 검색
2. 사진이 포함된 보도자료 선별
3. 기사 내용 요약 및 HTML 변환
4. PocketBase에 기사 생성
5. 이미지 URL로 썸네일 업로드
6. 사이트에서 표시 확인

---

## 개발 가이드

### 로컬 개발
```bash
cd C:\Users\user\projects\2026_active\gyeongin-blue-journal
npm run dev
```

### 주요 파일 구조
```
src/
├── app/
│   ├── (public)/          # 공개 페이지
│   │   ├── page.tsx       # 메인 페이지
│   │   ├── article/[slug] # 기사 상세
│   │   └── category/[slug]# 카테고리별 목록
│   ├── admin/             # 관리자 페이지
│   └── api/               # API 라우트
├── components/
│   ├── layout/            # 헤더, 푸터, 사이드바
│   ├── article/           # 기사 관련 컴포넌트
│   └── comment/           # 댓글 컴포넌트
├── lib/
│   └── pocketbase.ts      # PocketBase 설정
└── store/
    └── authStore.ts       # 인증 상태 관리
```

### PocketBase 연결 (Mixed Content 해결됨)
- 클라이언트: `/pb` 프록시 경로 사용
- 서버: 직접 PocketBase URL 사용
- `getPb()` 함수로 환경에 맞는 인스턴스 반환

### Git 커밋 & 배포
```bash
git add .
git commit -m "커밋 메시지"
git push origin main
# Vercel이 자동으로 배포
```

---

## 문제 해결

### Mixed Content 오류
- 원인: HTTPS 사이트에서 HTTP PocketBase 접근
- 해결: next.config.ts의 rewrites로 `/pb` 프록시 설정

### Auto-cancellation 오류
- 원인: PocketBase의 자동 요청 취소 기능
- 해결: `autoCancellation(false)` 설정

### 이미지 깨짐
- 원인: 썸네일이 없는 기사
- 해결: 썸네일 없는 기사 삭제 또는 이미지 추가

---

## 연락처
- GitHub: https://github.com/yonghwan1106/gyeongin-blue-journal
- 배포 URL: https://gyeongin-blue-journal.vercel.app/
