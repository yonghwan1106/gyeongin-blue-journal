'use client'

import { useEffect, useState, use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { getPb } from '@/lib/pocketbase'
import ArticleCard from '@/components/article/ArticleCard'
import Pagination from '@/components/common/Pagination'
import Sidebar from '@/components/layout/Sidebar'
import type { Article } from '@/types'

interface Region {
  id: string
  name: string
  slug: string
  type: 'province' | 'metro' | 'city' | 'county'
  order: number
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function RegionPage({ params }: PageProps) {
  const { slug } = use(params)
  const [region, setRegion] = useState<Region | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const perPage = 12

  useEffect(() => {
    fetchRegion()
  }, [slug])

  useEffect(() => {
    if (region) {
      fetchArticles()
    }
  }, [region, currentPage])

  const fetchRegion = async () => {
    try {
      const records = await getPb().collection('regions').getList<Region>(1, 1, {
        filter: `slug = "${slug}"`,
      })
      if (records.items.length === 0) {
        notFound()
        return
      }
      setRegion(records.items[0])
    } catch (error) {
      console.error('Failed to fetch region:', error)
      notFound()
    }
  }

  const fetchArticles = async () => {
    if (!region) return

    try {
      setLoading(true)
      // tags 필드에서 지역명으로 필터링
      const records = await getPb().collection('articles').getList<Article>(currentPage, perPage, {
        filter: `status = "published" && tags ~ "${region.name}"`,
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

  const getRegionTypeLabel = (type: string) => {
    switch (type) {
      case 'province': return '도'
      case 'metro': return '광역시'
      case 'city': return '시'
      case 'county': return '군'
      default: return ''
    }
  }

  if (!region) {
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
        <div className="flex items-center gap-2 text-sm text-secondary mb-2">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span>/</span>
          <Link href="/region" className="hover:text-primary">지역</Link>
          <span>/</span>
          <span className="text-primary">{region.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{region.name}</h1>
            <p className="text-secondary">{getRegionTypeLabel(region.type)} 뉴스</p>
          </div>
        </div>
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
              이 지역에 관련된 기사가 없습니다.
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
