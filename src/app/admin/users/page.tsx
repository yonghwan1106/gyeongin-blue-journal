'use client'

import { useEffect, useState } from 'react'
import { Search, Shield, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import pb from '@/lib/pocketbase'
import Pagination from '@/components/common/Pagination'
import type { User } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const perPage = 20

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      let filter = ''

      if (roleFilter) {
        filter = `role = "${roleFilter}"`
      }

      if (searchQuery) {
        const searchFilter = `(name ~ "${searchQuery}" || email ~ "${searchQuery}")`
        filter = filter ? `${filter} && ${searchFilter}` : searchFilter
      }

      const records = await pb.collection('users').getList<User>(currentPage, perPage, {
        filter: filter || undefined,
        sort: '-created',
      })

      setUsers(records.items)
      setTotalPages(records.totalPages)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`이 사용자의 권한을 "${newRole}"로 변경하시겠습니까?`)) return

    try {
      await pb.collection('users').update(userId, { role: newRole })
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user role:', error)
      alert('권한 변경에 실패했습니다.')
    }
  }

  const roleLabels: { [key: string]: { label: string; color: string } } = {
    admin: { label: '관리자', color: 'bg-red-100 text-red-700' },
    editor: { label: '에디터', color: 'bg-purple-100 text-purple-700' },
    author: { label: '기자', color: 'bg-blue-100 text-blue-700' },
    reader: { label: '일반회원', color: 'bg-slate-100 text-slate-700' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">회원 관리</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름 또는 이메일 검색..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">모든 권한</option>
            <option value="admin">관리자</option>
            <option value="editor">에디터</option>
            <option value="author">기자</option>
            <option value="reader">일반회원</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">회원</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">이메일</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">권한</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">가입일</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-secondary">권한 변경</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                        <div className="h-5 bg-slate-200 rounded w-24" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 bg-slate-200 rounded w-24 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-foreground">{user.name || '이름 없음'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${roleLabels[user.role]?.color || 'bg-slate-100 text-slate-700'}`}>
                        {roleLabels[user.role]?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {format(new Date(user.created), 'yyyy.MM.dd', { locale: ko })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="reader">일반회원</option>
                          <option value="author">기자</option>
                          <option value="editor">에디터</option>
                          <option value="admin">관리자</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                    회원이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
