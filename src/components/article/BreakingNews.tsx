'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase'
import type { Article } from '@/types'

export default function BreakingNews() {
  const [breakingNews, setBreakingNews] = useState<Article[]>([])

  useEffect(() => {
    fetchBreakingNews()
  }, [])

  const fetchBreakingNews = async () => {
    try {
      const records = await pb.collection('articles').getList<Article>(1, 5, {
        filter: 'status = "published" && is_breaking = true',
        sort: '-published_at',
      })
      setBreakingNews(records.items)
    } catch (error) {
      console.error('Failed to fetch breaking news:', error)
    }
  }

  if (breakingNews.length === 0) return null

  return (
    <div className="bg-accent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center py-2">
          <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-white/30">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold">속보</span>
          </div>
          <div className="overflow-hidden flex-1 ml-4">
            <div className="animate-marquee whitespace-nowrap">
              {breakingNews.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="inline-block hover:underline mr-16"
                >
                  {article.title}
                  {index < breakingNews.length - 1 && (
                    <span className="mx-8 text-white/50">|</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
