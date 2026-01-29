'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import pb from '@/lib/pocketbase'
import type { Article } from '@/types'

export default function HeadlineSlider() {
  const [headlines, setHeadlines] = useState<Article[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchHeadlines()
  }, [])

  const fetchHeadlines = async () => {
    try {
      const records = await pb.collection('articles').getList<Article>(1, 5, {
        filter: 'status = "published" && is_headline = true',
        sort: '-published_at',
        expand: 'category,author',
      })
      setHeadlines(records.items)
    } catch (error) {
      console.error('Failed to fetch headlines:', error)
    }
  }

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % headlines.length)
  }, [headlines.length])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + headlines.length) % headlines.length)
  }

  useEffect(() => {
    if (headlines.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [headlines.length, nextSlide])

  const getImageUrl = (article: Article) => {
    if (!article.thumbnail) return '/placeholder.jpg'
    return `${pb.baseUrl}/api/files/articles/${article.id}/${article.thumbnail}`
  }

  if (headlines.length === 0) {
    return (
      <div className="relative aspect-[21/9] bg-slate-200 rounded-xl flex items-center justify-center">
        <p className="text-secondary">헤드라인 기사가 없습니다</p>
      </div>
    )
  }

  const currentHeadline = headlines[currentIndex]

  return (
    <div className="relative aspect-[21/9] rounded-xl overflow-hidden group">
      {/* Background Image */}
      <Image
        src={getImageUrl(currentHeadline)}
        alt={currentHeadline.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
        <span className="inline-block bg-primary px-4 py-1 rounded-full text-sm font-medium mb-3">
          {currentHeadline.expand?.category?.name || '일반'}
        </span>
        <Link href={`/article/${currentHeadline.slug}`}>
          <h2 className="text-2xl md:text-4xl font-bold line-clamp-2 hover:text-blue-300 transition-colors mb-3">
            {currentHeadline.title}
          </h2>
        </Link>
        <p className="text-slate-300 line-clamp-2 max-w-3xl mb-4 hidden md:block">
          {currentHeadline.summary}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{currentHeadline.expand?.author?.name || '편집부'}</span>
          <span>
            {format(new Date(currentHeadline.published_at || currentHeadline.created), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
          </span>
        </div>
      </div>

      {/* Navigation Arrows */}
      {headlines.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {headlines.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {headlines.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
