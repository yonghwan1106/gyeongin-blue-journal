'use client'

import { useEffect, useState } from 'react'
import { getPb } from '@/lib/pocketbase'
import ArticleCard from './ArticleCard'
import type { Article } from '@/types'

interface RelatedArticlesProps {
  categoryId: string
  currentArticleId: string
}

export default function RelatedArticles({ categoryId, currentArticleId }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    fetchRelatedArticles()
  }, [categoryId, currentArticleId])

  const fetchRelatedArticles = async () => {
    try {
      const records = await getPb().collection('articles').getList<Article>(1, 4, {
        filter: `status = "published" && category = "${categoryId}" && id != "${currentArticleId}"`,
        sort: '-published_at',
        expand: 'category',
      })
      setArticles(records.items)
    } catch (error) {
      console.error('Failed to fetch related articles:', error)
    }
  }

  if (articles.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">관련 기사</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} variant="horizontal" />
        ))}
      </div>
    </div>
  )
}
