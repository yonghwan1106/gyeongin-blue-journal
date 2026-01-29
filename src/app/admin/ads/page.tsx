'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import pb from '@/lib/pocketbase'
import type { Advertisement } from '@/types'

export default function AdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    position: 'sidebar' as Advertisement['position'],
    start_date: '',
    end_date: '',
    is_active: true,
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('advertisements').getFullList<Advertisement>({
        sort: '-created',
      })
      setAds(records)
    } catch (error) {
      console.error('Failed to fetch ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad)
      setFormData({
        title: ad.title,
        link: ad.link,
        position: ad.position,
        start_date: ad.start_date.split('T')[0],
        end_date: ad.end_date.split('T')[0],
        is_active: ad.is_active,
      })
      if (ad.image) {
        setImagePreview(`${pb.baseUrl}/api/files/advertisements/${ad.id}/${ad.image}`)
      }
    } else {
      setEditingAd(null)
      setFormData({
        title: '',
        link: '',
        position: 'sidebar',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
      })
      setImagePreview(null)
    }
    setImageFile(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAd(null)
    setImagePreview(null)
    setImageFile(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.link.trim()) {
      alert('제목과 링크를 입력해주세요.')
      return
    }

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('link', formData.link)
      data.append('position', formData.position)
      data.append('start_date', new Date(formData.start_date).toISOString())
      data.append('end_date', new Date(formData.end_date).toISOString())
      data.append('is_active', String(formData.is_active))

      if (imageFile) {
        data.append('image', imageFile)
      }

      if (!editingAd) {
        data.append('clicks', '0')
      }

      if (editingAd) {
        await pb.collection('advertisements').update(editingAd.id, data)
      } else {
        await pb.collection('advertisements').create(data)
      }

      closeModal()
      fetchAds()
    } catch (error) {
      console.error('Failed to save ad:', error)
      alert('광고 저장에 실패했습니다.')
    }
  }

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      await pb.collection('advertisements').update(ad.id, {
        is_active: !ad.is_active,
      })
      fetchAds()
    } catch (error) {
      console.error('Failed to toggle ad:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 광고를 삭제하시겠습니까?')) return

    try {
      await pb.collection('advertisements').delete(id)
      fetchAds()
    } catch (error) {
      console.error('Failed to delete ad:', error)
      alert('광고 삭제에 실패했습니다.')
    }
  }

  const positionLabels: { [key: string]: string } = {
    header: '헤더',
    sidebar: '사이드바',
    article_top: '기사 상단',
    article_bottom: '기사 하단',
    footer: '푸터',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">광고 관리</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 광고
        </button>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-4">
              <div className="aspect-[4/3] bg-slate-200 rounded-lg mb-4" />
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))
        ) : ads.length > 0 ? (
          ads.map((ad) => (
            <div
              key={ad.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                ad.is_active ? 'border-green-200' : 'border-border opacity-60'
              }`}
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                {ad.image ? (
                  <img
                    src={`${pb.baseUrl}/api/files/advertisements/${ad.id}/${ad.image}`}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary">
                    이미지 없음
                  </div>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${
                  ad.is_active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                }`}>
                  {ad.is_active ? '활성' : '비활성'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground mb-1">{ad.title}</h3>
                <p className="text-sm text-secondary mb-2">
                  {positionLabels[ad.position] || ad.position}
                </p>
                <p className="text-xs text-secondary mb-3">
                  {format(new Date(ad.start_date), 'yyyy.MM.dd', { locale: ko })} ~{' '}
                  {format(new Date(ad.end_date), 'yyyy.MM.dd', { locale: ko })}
                </p>
                <p className="text-sm text-secondary mb-4">
                  클릭: <span className="font-medium text-foreground">{ad.clicks.toLocaleString()}</span>회
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(ad)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      ad.is_active
                        ? 'bg-slate-100 hover:bg-slate-200 text-secondary'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {ad.is_active ? '비활성화' : '활성화'}
                  </button>
                  <button
                    onClick={() => openModal(ad)}
                    className="p-2 text-secondary hover:text-primary transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="p-2 text-secondary hover:text-accent transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-secondary">
            등록된 광고가 없습니다
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingAd ? '광고 편집' : '새 광고'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  제목 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="광고 제목"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  배너 이미지
                </label>
                {imagePreview ? (
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-slate-50">
                    <span className="text-secondary">이미지 업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  링크 URL <span className="text-accent">*</span>
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  위치
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as Advertisement['position'] })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="sidebar">사이드바</option>
                  <option value="header">헤더</option>
                  <option value="article_top">기사 상단</option>
                  <option value="article_bottom">기사 하단</option>
                  <option value="footer">푸터</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <span className="text-sm text-foreground">활성화</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {editingAd ? '저장' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
