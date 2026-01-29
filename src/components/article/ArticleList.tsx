'use client'

import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase'
import ArticleCard from './ArticleCard'
import type { Article } from '@/types'

interface ArticleListProps {
  categorySlug?: string
  title?: string
  limit?: number
  showMore?: boolean
}

export default function ArticleList({
  categorySlug,
  title,
  limit = 6,
  showMore = false,
}: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [categorySlug])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      let filter = 'status = "published"'
      if (categorySlug) {
        filter += ` && category.slug = "${categorySlug}"`
      }

      const records = await pb.collection('articles').getList<Article>(1, limit, {
        filter,
        sort: '-published_at',
        expand: 'category,author',
      })
      setArticles(records.items)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-bold text-foreground">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
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
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-secondary">
        {title && <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>}
        <p>기사가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {showMore && categorySlug && (
            <a
              href={`/category/${categorySlug}`}
              className="text-sm text-primary hover:underline"
            >
              더보기 →
            </a>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
