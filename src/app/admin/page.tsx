'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Users, Eye, TrendingUp, Plus, BarChart3 } from 'lucide-react'
import pb from '@/lib/pocketbase'
import type { Article } from '@/types'

interface Stats {
  totalArticles: number
  publishedArticles: number
  totalUsers: number
  totalViews: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    totalUsers: 0,
    totalViews: 0,
  })
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [popularArticles, setPopularArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch stats
      const [articles, publishedArticles, users] = await Promise.all([
        pb.collection('articles').getList(1, 1),
        pb.collection('articles').getList(1, 1, { filter: 'status = "published"' }),
        pb.collection('users').getList(1, 1),
      ])

      // Calculate total views
      const allArticles = await pb.collection('articles').getFullList<Article>({
        fields: 'views',
      })
      const totalViews = allArticles.reduce((sum, a) => sum + (a.views || 0), 0)

      setStats({
        totalArticles: articles.totalItems,
        publishedArticles: publishedArticles.totalItems,
        totalUsers: users.totalItems,
        totalViews,
      })

      // Fetch recent articles
      const recent = await pb.collection('articles').getList<Article>(1, 5, {
        sort: '-created',
        expand: 'category,author',
      })
      setRecentArticles(recent.items)

      // Fetch popular articles
      const popular = await pb.collection('articles').getList<Article>(1, 5, {
        filter: 'status = "published"',
        sort: '-views',
        expand: 'category',
      })
      setPopularArticles(popular.items)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: '전체 기사',
      value: stats.totalArticles,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: '발행된 기사',
      value: stats.publishedArticles,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: '전체 회원',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: '총 조회수',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-orange-500',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-6">
              <div className="h-12 bg-slate-200 rounded-lg mb-4" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-border"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-secondary">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h2 className="font-bold text-lg text-foreground mb-4">빠른 작업</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 기사 작성
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-foreground rounded-lg hover:bg-slate-200 transition-colors"
          >
            카테고리 관리
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-foreground rounded-lg hover:bg-slate-200 transition-colors"
          >
            회원 관리
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-foreground">최근 기사</h2>
              <Link href="/admin/articles" className="text-sm text-primary hover:underline">
                전체보기
              </Link>
            </div>
          </div>
          <div className="divide-y divide-border">
            {recentArticles.length > 0 ? (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}/edit`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">{article.title}</h3>
                    <p className="text-sm text-secondary">
                      {article.expand?.category?.name || '미분류'} •{' '}
                      {new Date(article.created).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 text-xs rounded-full ${
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
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-secondary">기사가 없습니다</div>
            )}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-foreground">인기 기사</h2>
            </div>
          </div>
          <div className="divide-y divide-border">
            {popularArticles.length > 0 ? (
              popularArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-center gap-4 p-4"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index < 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">{article.title}</h3>
                    <p className="text-sm text-secondary">
                      {article.expand?.category?.name || '미분류'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-secondary shrink-0">
                    <Eye className="w-4 h-4" />
                    {article.views.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-secondary">기사가 없습니다</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
