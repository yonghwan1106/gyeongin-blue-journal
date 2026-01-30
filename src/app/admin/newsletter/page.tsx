'use client'

import { useEffect, useState } from 'react'
import { Mail, Users, UserCheck, UserX, Search, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getPb } from '@/lib/pocketbase'
import Pagination from '@/components/common/Pagination'
import type { NewsletterSubscriber } from '@/types'

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const perPage = 20

  useEffect(() => {
    fetchStats()
    fetchSubscribers()
  }, [currentPage, statusFilter])

  const fetchStats = async () => {
    try {
      const [all, active] = await Promise.all([
        getPb().collection('newsletter_subscribers').getList(1, 1),
        getPb().collection('newsletter_subscribers').getList(1, 1, { filter: 'is_active = true' }),
      ])
      setTotalItems(all.totalItems)
      setActiveCount(active.totalItems)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      let filter = ''

      if (statusFilter === 'active') {
        filter = 'is_active = true'
      } else if (statusFilter === 'inactive') {
        filter = 'is_active = false'
      }

      if (searchQuery) {
        const searchFilter = `email ~ "${searchQuery}"`
        filter = filter ? `${filter} && ${searchFilter}` : searchFilter
      }

      const records = await getPb().collection('newsletter_subscribers').getList<NewsletterSubscriber>(
        currentPage,
        perPage,
        {
          filter: filter || undefined,
          sort: '-created',
        }
      )

      setSubscribers(records.items)
      setTotalPages(records.totalPages)
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchSubscribers()
  }

  const handleToggleStatus = async (subscriber: NewsletterSubscriber) => {
    try {
      await getPb().collection('newsletter_subscribers').update(subscriber.id, {
        is_active: !subscriber.is_active,
      })
      fetchSubscribers()
      fetchStats()
    } catch (error) {
      console.error('Failed to update subscriber:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 구독자를 삭제하시겠습니까?')) return

    try {
      await getPb().collection('newsletter_subscribers').delete(id)
      fetchSubscribers()
      fetchStats()
    } catch (error) {
      console.error('Failed to delete subscriber:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  const exportSubscribers = async () => {
    try {
      const allSubscribers = await getPb().collection('newsletter_subscribers').getFullList<NewsletterSubscriber>({
        filter: 'is_active = true',
        sort: '-created',
      })

      const csv = ['이메일,가입일']
        .concat(
          allSubscribers.map(
            (s) => `${s.email},${format(new Date(s.created), 'yyyy-MM-dd')}`
          )
        )
        .join('\n')

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `newsletter_subscribers_${format(new Date(), 'yyyyMMdd')}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
      alert('내보내기에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">뉴스레터 관리</h1>
        <button
          onClick={exportSubscribers}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Mail className="w-4 h-4" />
          CSV 내보내기
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary">전체 구독자</p>
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary">활성 구독자</p>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center">
              <UserX className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-secondary">비활성 구독자</p>
              <p className="text-2xl font-bold text-foreground">{totalItems - activeCount}</p>
            </div>
          </div>
        </div>
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
                placeholder="이메일 검색..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">이메일</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">구독일</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-secondary">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : subscribers.length > 0 ? (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{subscriber.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          subscriber.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {subscriber.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {format(new Date(subscriber.created), 'yyyy.MM.dd HH:mm', { locale: ko })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(subscriber)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            subscriber.is_active
                              ? 'bg-slate-100 hover:bg-slate-200 text-secondary'
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          }`}
                        >
                          {subscriber.is_active ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleDelete(subscriber.id)}
                          className="p-2 text-secondary hover:text-accent transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-secondary">
                    구독자가 없습니다
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
