'use client'

import { useState } from 'react'
import { Facebook, Twitter, Link as LinkIcon, Check } from 'lucide-react'

interface ShareButtonsProps {
  title: string
  slug: string
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/article/${slug}`
  }

  const shareToFacebook = () => {
    const url = getShareUrl()
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      'facebook-share',
      'width=580,height=400'
    )
  }

  const shareToTwitter = () => {
    const url = getShareUrl()
    const text = `${title} - 경인블루저널`
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      'twitter-share',
      'width=580,height=400'
    )
  }

  const copyLink = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
      <span className="font-medium text-foreground">공유하기</span>
      <div className="flex gap-2">
        <button
          onClick={shareToFacebook}
          className="p-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"
          title="Facebook에 공유"
          aria-label="Facebook에 공유"
        >
          <Facebook className="w-5 h-5" />
        </button>
        <button
          onClick={shareToTwitter}
          className="p-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity"
          title="X에 공유"
          aria-label="X에 공유"
        >
          <Twitter className="w-5 h-5" />
        </button>
        <button
          onClick={copyLink}
          className={`p-2 text-white rounded-lg transition-all ${
            copied ? 'bg-green-500' : 'bg-secondary hover:opacity-90'
          }`}
          title={copied ? '복사됨!' : '링크 복사'}
          aria-label="링크 복사"
        >
          {copied ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
