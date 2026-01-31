import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Clock, Eye } from 'lucide-react'
import { getPb, getFileUrl } from '@/lib/pocketbase'
import { sanitizeSlug } from '@/lib/validation'
import type { Article } from '@/types'
import CommentSection from '@/components/comment/CommentSection'
import RelatedArticles from '@/components/article/RelatedArticles'
import Sidebar from '@/components/layout/Sidebar'
import ShareButtons from '@/components/article/ShareButtons'
import ArticleContent from '@/components/article/ArticleContent'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const safeSlug = sanitizeSlug(slug)
    if (!safeSlug) return null

    const records = await getPb().collection('articles').getList<Article>(1, 1, {
      filter: `slug = "${safeSlug}" && status = "published"`,
      expand: 'category,author',
    })
    if (records.items.length === 0) return null

    // Increment view count
    const article = records.items[0]
    await getPb().collection('articles').update(article.id, {
      views: article.views + 1
    }).catch(() => {})

    return article
  } catch (error) {
    console.error('Failed to fetch article:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return { title: '기사를 찾을 수 없습니다 - 경인블루저널' }
  }

  return {
    title: `${article.title} - 경인블루저널`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.expand?.author?.name || '편집부'],
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const getImageUrl = () => {
    return getFileUrl('articles', article.id, article.thumbnail)
  }

  const authorAvatarUrl = article.expand?.author?.avatar
    ? getFileUrl('authors', article.expand.author.id, article.expand.author.avatar)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-2">
          {/* Category & Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-secondary hover:text-primary">
              홈
            </Link>
            <span className="text-secondary">/</span>
            <Link
              href={`/category/${article.expand?.category?.slug || 'general'}`}
              className="text-primary font-medium"
            >
              {article.expand?.category?.name || '일반'}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-6">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(article.published_at || article.created), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.views.toLocaleString()}
            </span>
          </div>

          {/* Author */}
          {article.expand?.author && (
            <Link
              href={`/author/${article.expand.author.id}`}
              className="flex items-center gap-3 p-4 bg-muted rounded-xl mb-6 hover:bg-slate-100 transition-colors"
            >
              {authorAvatarUrl ? (
                <Image
                  src={authorAvatarUrl}
                  alt={article.expand.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {article.expand.author.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-foreground">{article.expand.author.name}</p>
                <p className="text-sm text-secondary">{article.expand.author.department || '기자'}</p>
              </div>
            </Link>
          )}

          {/* Thumbnail */}
          {article.thumbnail && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={getImageUrl()}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Summary */}
          <p className="text-lg text-secondary border-l-4 border-primary pl-4 mb-8">
            {article.summary}
          </p>

          {/* Content */}
          <ArticleContent content={article.content} />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-border">
              {article.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-muted text-secondary text-sm rounded-full hover:bg-primary hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <ShareButtons title={article.title} slug={article.slug} />

          {/* Comments */}
          <section className="mt-12">
            <CommentSection articleId={article.id} />
          </section>

          {/* Related Articles */}
          <section className="mt-12">
            <RelatedArticles
              categoryId={article.category}
              currentArticleId={article.id}
            />
          </section>
        </article>

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
