export interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  thumbnail: string
  category: string
  author: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  published_at: string
  views: number
  is_headline: boolean
  is_breaking: boolean
  created: string
  updated: string
  expand?: {
    category?: Category
    author?: Author
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  order: number
  created: string
  updated: string
}

export interface Author {
  id: string
  name: string
  email: string
  bio: string
  avatar: string
  department: string
  created: string
  updated: string
}

export interface Comment {
  id: string
  article: string
  user: string
  content: string
  parent: string | null
  likes: number
  created: string
  updated: string
  expand?: {
    user?: User
    parent?: Comment
  }
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: 'reader' | 'author' | 'editor' | 'admin'
  created: string
  updated: string
}

export interface Advertisement {
  id: string
  title: string
  image: string
  link: string
  position: 'header' | 'sidebar' | 'article_top' | 'article_bottom' | 'footer'
  start_date: string
  end_date: string
  is_active: boolean
  clicks: number
  created: string
  updated: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  is_active: boolean
  subscribed_at: string
  created: string
  updated: string
}

export interface Bookmark {
  id: string
  user: string
  article: string
  created: string
}

export interface ArticleStats {
  id: string
  article: string
  date: string
  views: number
  shares: number
  created: string
}
