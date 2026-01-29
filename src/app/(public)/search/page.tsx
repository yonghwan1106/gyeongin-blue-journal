'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import pb from '@/lib/pocketbase'
import ArticleCard from '@/components/article/ArticleCard'
import Pagination from '@/components/common/Pagination'
import Sidebar from '@/components/layout/Sidebar'
import type { Article } from '@/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [articles, setArticles] = useState<Article[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(query)
  const perPage = 12

  useEffect(() => {
    setSearchInput(query)
    setCurrentPage(1)
    if (query) {
      fetchArticles()
    } else {
      setArticles([])
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    if (query) {
      fetchArticles()
    }
  }, [currentPage])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('articles').getList<Article>(currentPage, perPage, {
        filter: `status = "published" && (title ~ "${query}" || summary ~ "${query}" || content ~ "${query}")`,
        sort: '-published_at',
        expand: 'category,author',
      })
      setArticles(records.items)
      setTotalPages(records.totalPages)
      setTotalItems(records.totalItems)
    } catch (error) {
      console.error('Failed to search articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput)}`
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">검색</h1>
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="기사 검색..."
            className="w-full px-4 py-3 pr-12 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-secondary hover:text-primary"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
        {query && !loading && (
          <p className="mt-4 text-secondary">
            "{query}" 검색 결과: <span className="font-medium text-foreground">{totalItems}개</span>의 기사
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Results */}
        <div className="lg:col-span-2">
          {!query ? (
            <div className="text-center py-12 text-secondary">
              검색어를 입력하세요.
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 aspect-[16/10] rounded-xl mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 rounded" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary mb-4">"{query}"에 대한 검색 결과가 없습니다.</p>
              <p className="text-sm text-secondary">다른 검색어로 다시 시도해보세요.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 rounded w-1/4 mb-4" />
          <div className="h-12 bg-slate-200 rounded max-w-2xl mb-8" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
