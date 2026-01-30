'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { getPb } from '@/lib/pocketbase'
import { useAuthStore } from '@/store/authStore'
import type { Category, Author } from '@/types'

export default function NewArticlePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cats, auths] = await Promise.all([
        getPb().collection('categories').getFullList<Category>({ sort: 'order' }),
        getPb().collection('authors').getFullList<Author>({ sort: 'name' }),
      ])
      setCategories(cats)
      setAuthors(auths)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100) + '-' + Date.now().toString(36)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent, saveStatus?: 'draft' | 'published') => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('slug', formData.slug || generateSlug(formData.title))
      data.append('summary', formData.summary)
      data.append('content', formData.content)
      data.append('status', saveStatus || formData.status)
      data.append('is_headline', String(formData.is_headline))
      data.append('is_breaking', String(formData.is_breaking))
      data.append('views', '0')

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
      if (saveStatus === 'published') {
        data.append('published_at', new Date().toISOString())
      }

      const record = await getPb().collection('articles').create(data)
      router.push(`/admin/articles/${record.id}/edit`)
    } catch (error) {
      console.error('Failed to create article:', error)
      alert('기사 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-foreground">새 기사 작성</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            임시저장
          </button>
          <button
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            발행하기
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
            onChange={handleTitleChange}
            placeholder="기사 제목을 입력하세요"
            className="w-full px-4 py-3 text-lg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Thumbnail */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            대표 이미지
          </label>
          {thumbnailPreview ? (
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
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="기사 내용을 입력하세요 (HTML 지원)"
            rows={20}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            required
          />
          <p className="mt-2 text-sm text-secondary">
            HTML 태그를 사용할 수 있습니다. (예: &lt;p&gt;, &lt;h2&gt;, &lt;img&gt;, &lt;blockquote&gt;)
          </p>
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
