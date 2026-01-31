/**
 * 사용자에게 표시할 에러 메시지를 반환합니다.
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // 네트워크 에러
    if (message.includes('network') || message.includes('fetch')) {
      return '네트워크 연결을 확인해주세요.'
    }

    // 인증 에러
    if (message.includes('unauthorized') || message.includes('401')) {
      return '로그인이 필요하거나 세션이 만료되었습니다.'
    }

    // 권한 에러
    if (message.includes('forbidden') || message.includes('403')) {
      return '접근 권한이 없습니다.'
    }

    // 404 에러
    if (message.includes('not found') || message.includes('404')) {
      return '요청한 정보를 찾을 수 없습니다.'
    }

    // 유효성 검사 에러
    if (message.includes('validation') || message.includes('invalid')) {
      return '입력한 정보를 확인해주세요.'
    }

    // 중복 에러
    if (message.includes('duplicate') || message.includes('already exists')) {
      return '이미 존재하는 정보입니다.'
    }
  }

  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}

/**
 * 콘솔에 에러를 로깅하고 사용자 친화적 메시지를 반환합니다.
 */
export function handleError(error: unknown, context?: string): string {
  const contextPrefix = context ? `[${context}] ` : ''
  console.error(`${contextPrefix}Error:`, error)
  return getUserFriendlyErrorMessage(error)
}
