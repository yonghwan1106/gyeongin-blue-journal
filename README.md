# 경인블루저널 (Gyeongin Blue Journal)

경인 지역의 정치, 경제, 사회, 문화 소식을 빠르고 정확하게 전달하는 인터넷 신문사 웹사이트입니다.

## 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: PocketBase
- **State Management**: Zustand
- **Deployment**: Vercel (Frontend), Vultr VPS (PocketBase)

## 주요 기능

### 공개 기능
- 📰 기사 목록 및 상세 보기
- 🔍 기사 검색
- 📂 카테고리별 기사 필터링
- 💬 댓글 시스템 (대댓글 지원)
- 🔖 기사 북마크
- 📧 뉴스레터 구독

### 관리자 기능
- 📝 기사 작성/수정/삭제 (WYSIWYG 에디터)
- 📊 통계 대시보드
- 👥 회원 관리
- 📁 카테고리 관리
- 📢 광고 배너 관리
- 📬 뉴스레터 구독자 관리

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://your-pocketbase-url:8090
```

### 개발 서버 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (public)/          # 공개 페이지
│   ├── (auth)/            # 인증 페이지
│   ├── admin/             # 관리자 페이지
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── article/          # 기사 관련 컴포넌트
│   ├── comment/          # 댓글 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                   # 유틸리티 및 설정
├── store/                 # Zustand 스토어
└── types/                 # TypeScript 타입 정의
```

## PocketBase 컬렉션

- `categories` - 기사 카테고리
- `authors` - 기자/작성자 프로필
- `articles` - 기사
- `comments` - 댓글
- `advertisements` - 광고 배너
- `newsletter_subscribers` - 뉴스레터 구독자
- `bookmarks` - 사용자 북마크
- `users` - 사용자 (auth collection)

## 라이선스

MIT License

---

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
