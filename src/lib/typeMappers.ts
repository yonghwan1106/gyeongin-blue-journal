import type { User } from '@/types'
import type { RecordModel } from 'pocketbase'

/**
 * PocketBase RecordModel을 User 타입으로 안전하게 변환합니다.
 */
export function mapRecordToUser(record: RecordModel | null): User | null {
  if (!record) {
    return null
  }

  return {
    id: record.id || '',
    email: typeof record.email === 'string' ? record.email : '',
    name: typeof record.name === 'string' ? record.name : '',
    avatar: typeof record.avatar === 'string' ? record.avatar : '',
    role: isValidRole(record.role) ? record.role : 'reader',
    created: typeof record.created === 'string' ? record.created : '',
    updated: typeof record.updated === 'string' ? record.updated : '',
  }
}

function isValidRole(role: unknown): role is User['role'] {
  return role === 'reader' || role === 'author' || role === 'editor' || role === 'admin'
}
