'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Image as ImageIcon, X, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getPb, getFileUrl } from '@/lib/pocketbase'
import { compressThumbnail } from '@/lib/imageCompressor'
import type { Article, Category, Author } from '@/types'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg" />,
})

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditArticlePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '',
    author: '',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_headline: false,
    is_breaking: false,
  })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [compressing, setCompressing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [articleData, cats, auths] = await Promise.all([
        getPb().collection('articles').getOne<Article>(id, { expand: 'category,author' }),
        getPb().collection('categories').getFullList<Category>({ sort: 'order' }),
        getPb().collection('authors').getFullList<Author>({ sort: 'name' }),
      ])

      setArticle(articleData)
      setCategories(cats)
      setAuthors(auths)

      setFormData({
        title: articleData.title,
        slug: articleData.slug,
        summary: articleData.summary || '',
        content: articleData.content,
        category: articleData.category || '',
        author: articleData.author || '',
        tags: articleData.tags?.join(', ') || '',
        status: articleData.status,
        is_headline: articleData.is_headline,
        is_breaking: articleData.is_breaking,
      })

      if (articleData.thumbnail) {
        setThumbnailPreview(getFileUrl('articles', articleData.id, articleData.thumbnail))
      }
    } catch (error) {
      console.error('Failed to fetch article:', error)
      alert('기사를 불러올 수 없습니다.')
      router.push('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCompressing(true)
      try {
        const compressedFile = await compressThumbnail(file)
        setThumbnailFile(compressedFile)
        const reader = new FileReader()
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string)
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('이미지 압축 실패:', error)
        setThumbnailFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } finally {
        setCompressing(false)
      }
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent, saveStatus?: 'draft' | 'published' | 'archived') => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    setSaving(true)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('slug', formData.slug)
      data.append('summary', formData.summary)
      data.append('content', formData.content)
      data.append('status', saveStatus || formData.status)
      data.append('is_headline', String(formData.is_headline))
      data.append('is_breaking', String(formData.is_breaking))

      if (formData.category) {
        data.append('category', formData.category)
      }
      if (formData.author) {
        data.append('author', formData.author)
      }
      if (formData.tags) {
        data.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(Boolean)))
      }
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile)
      }
      if (saveStatus === 'published' && article?.status !== 'published') {
        data.append('published_at', new Date().toISOString())
      }

      await getPb().collection('articles').update(id, data)
      alert('저장되었습니다.')
      fetchData()
    } catch (error) {
      console.error('Failed to update article:', error)
      alert('기사 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 기사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

    try {
      await getPb().collection('articles').delete(id)
      router.push('/admin/articles')
    } catch (error) {
      console.error('Failed to delete article:', error)
      alert('기사 삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-slate-200 rounded-lg w-1/3" />
          <div className="h-64 bg-slate-200 rounded-xl" />
          <div className="h-96 bg-slate-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">기사 편집</h1>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              article?.status === 'published'
                ? 'bg-green-100 text-green-700'
                : article?.status === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {article?.status === 'published'
              ? '발행됨'
              : article?.status === 'draft'
              ? '임시저장'
              : '보관됨'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-accent border border-accent rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
          <button
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
          <button
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            {article?.status === 'published' ? '업데이트' : '발행하기'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            제목 <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="기사 제목을 입력하세요"
            className="w-full px-4 py-3 text-lg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <div className="mt-2">
            <label className="block text-sm text-secondary mb-1">URL 슬러그</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            대표 이미지
          </label>
          {compressing ? (
            <div className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-lg bg-slate-50">
              <Loader2 className="w-12 h-12 text-primary mb-2 animate-spin" />
              <span className="text-secondary">이미지 최적화 중...</span>
            </div>
          ) : thumbnailPreview ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
              <img
                src={thumbnailPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <ImageIcon className="w-12 h-12 text-secondary mb-2" />
              <span className="text-secondary">이미지를 업로드하세요</span>
              <span className="text-xs text-secondary mt-1">자동으로 최적화됩니다 (최대 200KB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            요약 (150자 이내)
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="기사 요약을 입력하세요"
            rows={3}
            maxLength={150}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="mt-1 text-sm text-secondary text-right">
            {formData.summary.length}/150
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            본문 <span className="text-accent">*</span>
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="기사 내용을 입력하세요..."
          />
        </div>

        {/* Meta */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-medium text-foreground mb-4">기사 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">카테고리 선택</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                작성자
              </label>
              <select
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">작성자 선택</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                태그 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="경기도, 인천, 지역뉴스"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_headline}
                onChange={(e) => setFormData({ ...formData, is_headline: e.target.checked })}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-foreground">헤드라인 기사</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_breaking}
                onChange={(e) => setFormData({ ...formData, is_breaking: e.target.checked })}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-foreground">속보</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  )
}
