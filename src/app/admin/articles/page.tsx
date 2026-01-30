'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getPb } from '@/lib/pocketbase'
import Pagination from '@/components/common/Pagination'
import type { Article, Category } from '@/types'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const perPage = 20

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [currentPage, statusFilter, categoryFilter])

  const fetchCategories = async () => {
    try {
      const records = await getPb().collection('categories').getFullList<Category>({
        sort: 'order',
      })
      setCategories(records)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchArticles = async () => {
    try {
      setLoading(true)
      let filter = ''

      if (statusFilter) {
        filter += `status = "${statusFilter}"`
      }

      if (categoryFilter) {
        filter += filter ? ` && category = "${categoryFilter}"` : `category = "${categoryFilter}"`
      }

      if (searchQuery) {
        const searchFilter = `(title ~ "${searchQuery}" || summary ~ "${searchQuery}")`
        filter += filter ? ` && ${searchFilter}` : searchFilter
      }

      const records = await getPb().collection('articles').getList<Article>(currentPage, perPage, {
        filter: filter || undefined,
        sort: '-created',
        expand: 'category,author',
      })

      setArticles(records.items)
      setTotalPages(records.totalPages)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchArticles()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 기사를 삭제하시겠습니까?')) return

    try {
      await getPb().collection('articles').delete(id)
      fetchArticles()
    } catch (error) {
      console.error('Failed to delete article:', error)
      alert('기사 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">기사 관리</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 기사 작성
        </Link>
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
                placeholder="기사 검색..."
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
            <option value="draft">임시저장</option>
            <option value="published">발행됨</option>
            <option value="archived">보관됨</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">모든 카테고리</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">제목</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">카테고리</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">상태</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">조회수</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">작성일</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-secondary">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-12" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-slate-200 rounded w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : articles.length > 0 ? (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="font-medium text-foreground truncate">{article.title}</p>
                        <p className="text-sm text-secondary truncate">{article.summary}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {article.expand?.category?.name || '미분류'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : article.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {article.status === 'published'
                          ? '발행'
                          : article.status === 'draft'
                          ? '임시저장'
                          : '보관'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-secondary">
                        <Eye className="w-4 h-4" />
                        {article.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">
                      {format(new Date(article.created), 'yyyy.MM.dd', { locale: ko })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/article/${article.slug}`}
                          target="_blank"
                          className="p-2 text-secondary hover:text-primary transition-colors"
                          title="보기"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-2 text-secondary hover:text-primary transition-colors"
                          title="편집"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-secondary hover:text-accent transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                    기사가 없습니다
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
