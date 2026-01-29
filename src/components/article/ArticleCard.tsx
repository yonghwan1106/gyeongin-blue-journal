import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import pb from '@/lib/pocketbase'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'horizontal' | 'featured'
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const getImageUrl = () => {
    if (!article.thumbnail) return '/placeholder.jpg'
    return `${pb.baseUrl}/api/files/articles/${article.id}/${article.thumbnail}`
  }

  const categoryName = article.expand?.category?.name || '일반'

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="flex gap-4 group"
      >
        <div className="relative w-32 h-24 shrink-0 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl()}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-primary">{categoryName}</span>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(article.published_at || article.created), 'MM.dd', { locale: ko })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="block group relative aspect-[16/9] rounded-xl overflow-hidden"
      >
        <Image
          src={getImageUrl()}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <span className="inline-block bg-primary px-3 py-1 rounded-full text-xs font-medium mb-3">
            {categoryName}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold line-clamp-2 mb-2">
            {article.title}
          </h2>
          <p className="text-sm text-slate-300 line-clamp-2 mb-3">
            {article.summary}
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{article.expand?.author?.name || '편집부'}</span>
            <span>
              {format(new Date(article.published_at || article.created), 'yyyy년 M월 d일', { locale: ko })}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      className="block group bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {article.is_breaking && (
          <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
            속보
          </span>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-primary">{categoryName}</span>
        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1 mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-secondary line-clamp-2 mb-3">
          {article.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-secondary">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(article.published_at || article.created), 'M월 d일', { locale: ko })}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.views.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
