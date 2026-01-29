'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import pb from '@/lib/pocketbase'
import type { Category } from '@/types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: 0,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('categories').getFullList<Category>({
        sort: 'order',
      })
      setCategories(records)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    const slugMap: { [key: string]: string } = {
      '정치': 'politics',
      '경제': 'economy',
      '사회': 'society',
      '문화': 'culture',
      '스포츠': 'sports',
      'IT': 'it',
      '오피니언': 'opinion',
      '지역': 'local',
    }
    return slugMap[name] || name.toLowerCase().replace(/\s+/g, '-')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        order: category.order || 0,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        order: categories.length,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '', order: 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('이름과 슬러그를 입력해주세요.')
      return
    }

    try {
      if (editingCategory) {
        await pb.collection('categories').update(editingCategory.id, formData)
      } else {
        await pb.collection('categories').create(formData)
      }
      closeModal()
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('카테고리 저장에 실패했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 카테고리를 삭제하시겠습니까?')) return

    try {
      await pb.collection('categories').delete(id)
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('카테고리 삭제에 실패했습니다. 이 카테고리에 속한 기사가 있을 수 있습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">카테고리 관리</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 카테고리
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : categories.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary w-12">#</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">이름</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">슬러그</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-secondary">설명</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-secondary">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-secondary">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{category.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-slate-100 rounded text-sm">{category.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(category)}
                        className="p-2 text-secondary hover:text-primary transition-colors"
                        title="편집"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-secondary hover:text-accent transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-secondary">
            카테고리가 없습니다
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingCategory ? '카테고리 편집' : '새 카테고리'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  이름 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="카테고리 이름"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  슬러그 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-slug"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="카테고리 설명"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  순서
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
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
                  {editingCategory ? '저장' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
