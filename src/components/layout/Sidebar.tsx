'use client'

import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Eye, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { getPb, getFileUrl } from '@/lib/pocketbase'
import { isValidEmail } from '@/lib/validation'
import { handleError } from '@/lib/errorHandler'
import type { Article, Advertisement } from '@/types'

export default function Sidebar() {
  const [popularArticles, setPopularArticles] = useState<Article[]>([])
  const [ads, setAds] = useState<Advertisement[]>([])
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')

  const fetchPopularArticles = useCallback(async () => {
    try {
      const records = await getPb().collection('articles').getList<Article>(1, 10, {
        filter: 'status = "published"',
        sort: '-views',
        expand: 'category',
      })
      setPopularArticles(records.items)
    } catch (error) {
      console.error('Failed to fetch popular articles:', error)
    }
  }, [])

  const fetchAds = useCallback(async () => {
    try {
      const now = new Date().toISOString()
      const records = await getPb().collection('advertisements').getList<Advertisement>(1, 5, {
        filter: `position = "sidebar" && is_active = true && start_date <= "${now}" && end_date >= "${now}"`,
      })
      setAds(records.items)
    } catch (error) {
      console.error('Failed to fetch ads:', error)
    }
  }, [])

  useEffect(() => {
    fetchPopularArticles()
    fetchAds()
  }, [fetchPopularArticles, fetchAds])

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(newsletterEmail)) {
      setNewsletterStatus('error')
      setNewsletterMessage('올바른 이메일 주소를 입력해주세요.')
      return
    }

    setNewsletterStatus('loading')

    try {
      await getPb().collection('newsletter_subscribers').create({
        email: newsletterEmail,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      })
      setNewsletterStatus('success')
      setNewsletterMessage('구독 신청이 완료되었습니다!')
      setNewsletterEmail('')
      setTimeout(() => {
        setNewsletterStatus('idle')
        setNewsletterMessage('')
      }, 3000)
    } catch (error) {
      setNewsletterStatus('error')
      const errorMessage = handleError(error, 'Newsletter')
      if (errorMessage.includes('이미 존재')) {
        setNewsletterMessage('이미 구독 중인 이메일입니다.')
      } else {
        setNewsletterMessage('구독 신청에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  const getArticleImageUrl = (article: Article) => {
    return getFileUrl('articles', article.id, article.thumbnail)
  }

  const getAdImageUrl = (ad: Advertisement) => {
    return getFileUrl('advertisements', ad.id, ad.image)
  }

  return (
    <aside className="space-y-6">
      {/* Popular Articles */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="bg-primary px-4 py-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold">인기 기사 TOP 10</h3>
        </div>
        <div className="divide-y divide-border">
          {popularArticles.length > 0 ? (
            popularArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="flex items-start gap-3 p-4 hover:bg-muted transition-colors"
              >
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                  ${index < 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}
                `}>
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium line-clamp-2 text-foreground">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                    <Eye className="w-3 h-3" />
                    <span>{article.views.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-secondary text-sm">
              인기 기사가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Advertisements */}
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
          onClick={async () => {
            try {
              await getPb().collection('advertisements').update(ad.id, {
                clicks: ad.clicks + 1
              })
            } catch (error) {
              console.error('Failed to track ad click:', error)
            }
          }}
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={getAdImageUrl(ad)}
              alt={ad.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            광고
          </div>
        </a>
      ))}

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-2">뉴스레터 구독</h3>
        <p className="text-sm text-blue-100 mb-4">
          매일 아침, 주요 뉴스를 이메일로 받아보세요.
        </p>
        <form onSubmit={handleNewsletterSubmit} className="space-y-2">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="이메일 주소"
            className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-white"
            disabled={newsletterStatus === 'loading'}
            aria-label="뉴스레터 구독 이메일"
          />
          <button
            type="submit"
            disabled={newsletterStatus === 'loading'}
            className="w-full bg-white text-primary font-bold py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {newsletterStatus === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '구독하기'
            )}
          </button>
          {newsletterMessage && (
            <div className={`flex items-center gap-2 text-sm ${
              newsletterStatus === 'success' ? 'text-green-200' : 'text-red-200'
            }`}>
              {newsletterStatus === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {newsletterMessage}
            </div>
          )}
        </form>
      </div>
    </aside>
  )
}
