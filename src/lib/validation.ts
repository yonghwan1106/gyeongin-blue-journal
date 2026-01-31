/**
 * slug 값을 안전하게 sanitize합니다.
 * 영문 소문자, 숫자, 하이픈만 허용합니다.
 */
export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    return ''
  }
  // 영문 소문자, 숫자, 하이픈만 허용
  return slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

/**
 * PocketBase 필터 쿼리에 사용할 값을 안전하게 이스케이프합니다.
 * 쿼리 인젝션 공격을 방지합니다.
 */
export function sanitizeFilterValue(value: string): string {
  if (!value || typeof value !== 'string') {
    return ''
  }
  // 큰따옴표, 백슬래시, 줄바꿈 등 위험한 문자 이스케이프
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

/**
 * 검색 쿼리를 안전하게 sanitize합니다.
 * PocketBase의 ~ (contains) 연산자에 사용됩니다.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return ''
  }
  // 특수문자 제거하고 최대 길이 제한
  return query
    .replace(/[<>"'`;\\]/g, '')
    .trim()
    .slice(0, 100)
}

/**
 * 이메일 형식 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
