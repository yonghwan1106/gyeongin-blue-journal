'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Bookmark, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import pb from '@/lib/pocketbase'
import ArticleCard from '@/components/article/ArticleCard'
import type { Article, Bookmark as BookmarkType } from '@/types'

export default function MyPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore()
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([])
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'settings'>('bookmarks')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    }
  }, [user])

  const fetchBookmarks = async () => {
    if (!user) return

    try {
      setLoading(true)
      const bookmarks = await pb.collection('bookmarks').getList<BookmarkType>(1, 50, {
        filter: `user = "${user.id}"`,
        sort: '-created',
      })

      if (bookmarks.items.length > 0) {
        const articleIds = bookmarks.items.map(b => b.article)
        const articles = await pb.collection('articles').getList<Article>(1, 50, {
          filter: articleIds.map(id => `id = "${id}"`).join(' || '),
          expand: 'category,author',
        })
        setBookmarkedArticles(articles.items)
      } else {
        setBookmarkedArticles([])
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 rounded-2xl mb-8" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-48 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-blue-100">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
              {user?.role === 'admin' ? '관리자' : '일반 회원'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'bookmarks'
              ? 'text-primary border-primary'
              : 'text-secondary border-transparent hover:text-foreground'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          북마크
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'settings'
              ? 'text-primary border-primary'
              : 'text-secondary border-transparent hover:text-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          설정
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'bookmarks' && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            북마크한 기사 ({bookmarkedArticles.length})
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 aspect-[16/10] rounded-xl mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : bookmarkedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarkedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-xl">
              <Bookmark className="w-12 h-12 text-secondary mx-auto mb-4" />
              <p className="text-secondary mb-4">북마크한 기사가 없습니다.</p>
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                기사 둘러보기
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-bold text-foreground mb-4">계정 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-secondary mb-1">이름</label>
                <p className="text-foreground">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1">이메일</label>
                <p className="text-foreground">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1">가입일</label>
                <p className="text-foreground">
                  {user?.created ? new Date(user.created).toLocaleDateString('ko-KR') : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-bold text-foreground mb-4">계정 관리</h3>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-accent hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
