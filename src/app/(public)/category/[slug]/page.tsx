'use client'

import { useEffect, useState, use } from 'react'
import { notFound } from 'next/navigation'
import pb from '@/lib/pocketbase'
import ArticleCard from '@/components/article/ArticleCard'
import Pagination from '@/components/common/Pagination'
import Sidebar from '@/components/layout/Sidebar'
import type { Article, Category } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params)
  const [category, setCategory] = useState<Category | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const perPage = 12

  useEffect(() => {
    fetchCategory()
  }, [slug])

  useEffect(() => {
    if (category) {
      fetchArticles()
    }
  }, [category, currentPage])

  const fetchCategory = async () => {
    try {
      const records = await pb.collection('categories').getList<Category>(1, 1, {
        filter: `slug = "${slug}"`,
      })
      if (records.items.length === 0) {
        notFound()
        return
      }
      setCategory(records.items[0])
    } catch (error) {
      console.error('Failed to fetch category:', error)
      notFound()
    }
  }

  const fetchArticles = async () => {
    if (!category) return

    try {
      setLoading(true)
      const records = await pb.collection('articles').getList<Article>(currentPage, perPage, {
        filter: `status = "published" && category = "${category.id}"`,
        sort: '-published_at',
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

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="bg-slate-200 aspect-[16/10] rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-6 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-secondary">{category.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles Grid */}
        <div className="lg:col-span-2">
          {loading ? (
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
            <div className="text-center py-12 text-secondary">
              이 카테고리에 기사가 없습니다.
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
