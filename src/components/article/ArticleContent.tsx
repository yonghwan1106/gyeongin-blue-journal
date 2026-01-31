'use client'

import { sanitizeHtml } from '@/lib/sanitize'

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const sanitizedContent = sanitizeHtml(content)

  return (
    <div
      className="article-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}
