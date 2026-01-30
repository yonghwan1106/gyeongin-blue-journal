import PocketBase from 'pocketbase'

// 실제 PocketBase 서버 URL (서버사이드 렌더링용)
export const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://158.247.210.200:8090'

// 서버용 PocketBase 인스턴스
const serverPb = new PocketBase(PB_URL)
serverPb.autoCancellation(false) // 자동 취소 비활성화

// 클라이언트용 PocketBase 인스턴스 (lazy initialization)
let clientPb: PocketBase | null = null

// 현재 환경에 맞는 PocketBase 인스턴스 반환
// 클라이언트: /pb 프록시 경로 사용 (HTTPS Mixed Content 문제 해결)
// 서버: 직접 PocketBase URL 사용
export function getPb(): PocketBase {
  if (typeof window !== 'undefined') {
    // 클라이언트: 프록시 경로 사용
    if (!clientPb) {
      clientPb = new PocketBase('/pb')
      clientPb.autoCancellation(false) // 자동 취소 비활성화
    }
    return clientPb
  }
  // 서버: 직접 연결
  return serverPb
}

// 파일 URL 생성 헬퍼 함수
export const getFileUrl = (collectionName: string, recordId: string, fileName: string) => {
  if (!fileName) return '/placeholder.jpg'
  // 클라이언트: 프록시를 통해 파일 접근
  if (typeof window !== 'undefined') {
    return `/pb/api/files/${collectionName}/${recordId}/${fileName}`
  }
  // 서버: 직접 PocketBase URL 사용
  return `${PB_URL}/api/files/${collectionName}/${recordId}/${fileName}`
}

// 기본 export - 서버용 인스턴스 (서버 컴포넌트에서 사용)
// 클라이언트 컴포넌트에서는 getPb() 사용 권장
export default serverPb
