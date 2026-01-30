'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, Menu, X, User, LogOut, Bookmark } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getPb } from '@/lib/pocketbase'
import type { Category } from '@/types'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
    fetchCategories()
  }, [checkAuth])

  const fetchCategories = async () => {
    try {
      const records = await getPb().collection('categories').getList<Category>(1, 10, {
        sort: 'order',
      })
      setCategories(records.items)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary text-white py-1 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>{new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}</span>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline">안녕하세요, {user?.name}님</span>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="hover:underline">관리자</Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline">로그인</Link>
                <Link href="/register" className="hover:underline">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">경</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">경인블루저널</h1>
              <p className="text-xs text-secondary -mt-1">Gyeongin Blue Journal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Menu */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/mypage" className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Bookmark className="w-5 h-5" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="mt-4 animate-fade-in">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="기사 검색..."
                className="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-secondary hover:text-primary"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="lg:hidden border-t border-border animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="block py-2 text-foreground hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <hr className="my-2 border-border" />
                <Link
                  href="/mypage"
                  className="block py-2 text-foreground hover:text-primary font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  마이페이지
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="block py-2 text-foreground hover:text-primary font-medium"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
