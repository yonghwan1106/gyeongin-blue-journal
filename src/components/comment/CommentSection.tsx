'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Send, ThumbsUp, Reply, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import pb from '@/lib/pocketbase'
import { useAuthStore } from '@/store/authStore'
import type { Comment } from '@/types'

interface CommentSectionProps {
  articleId: string
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchComments()
  }, [articleId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('comments').getList<Comment>(1, 100, {
        filter: `article = "${articleId}"`,
        sort: '-created',
        expand: 'user,parent',
      })
      setComments(records.items)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    if (!isAuthenticated || !user) {
      alert('로그인이 필요합니다.')
      return
    }

    const content = parentId ? replyContent : newComment
    if (!content.trim()) return

    try {
      await pb.collection('comments').create({
        article: articleId,
        user: user.id,
        content: content.trim(),
        parent: parentId || null,
        likes: 0,
      })

      if (parentId) {
        setReplyContent('')
        setReplyTo(null)
      } else {
        setNewComment('')
      }

      fetchComments()
    } catch (error) {
      console.error('Failed to create comment:', error)
      alert('댓글 작성에 실패했습니다.')
    }
  }

  const handleLike = async (commentId: string, currentLikes: number) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      await pb.collection('comments').update(commentId, {
        likes: currentLikes + 1,
      })
      fetchComments()
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      await pb.collection('comments').delete(commentId)
      fetchComments()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  const parentComments = comments.filter(c => !c.parent)
  const getReplies = (parentId: string) => comments.filter(c => c.parent === parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          댓글 {comments.length}개
        </h2>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성하세요..."
            className="w-full px-4 py-3 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              댓글 작성
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 bg-muted rounded-xl">
          <p className="text-secondary mb-3">댓글을 작성하려면 로그인이 필요합니다.</p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            로그인하기
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : parentComments.length > 0 ? (
        <div className="space-y-6">
          {parentComments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              {/* Parent Comment */}
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {(comment.expand?.user?.name || '익명').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">
                      {comment.expand?.user?.name || '익명'}
                    </span>
                    <span className="text-xs text-secondary">
                      {format(new Date(comment.created), 'M월 d일 HH:mm', { locale: ko })}
                    </span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleLike(comment.id, comment.likes)}
                      className="flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span>답글</span>
                    </button>
                    {user?.id === comment.user && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="flex items-center gap-1 text-sm text-secondary hover:text-accent transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>삭제</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment.id && isAuthenticated && (
                    <form
                      onSubmit={(e) => handleSubmit(e, comment.id)}
                      className="mt-4 flex gap-2"
                    >
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 작성하세요..."
                        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!replyContent.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                      >
                        답글
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="flex gap-3 ml-12">
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                    {(reply.expand?.user?.name || '익명').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">
                        {reply.expand?.user?.name || '익명'}
                      </span>
                      <span className="text-xs text-secondary">
                        {format(new Date(reply.created), 'M월 d일 HH:mm', { locale: ko })}
                      </span>
                    </div>
                    <p className="text-foreground text-sm whitespace-pre-wrap">{reply.content}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <button
                        onClick={() => handleLike(reply.id, reply.likes)}
                        className="flex items-center gap-1 text-xs text-secondary hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{reply.likes}</span>
                      </button>
                      {user?.id === reply.user && (
                        <button
                          onClick={() => handleDelete(reply.id)}
                          className="flex items-center gap-1 text-xs text-secondary hover:text-accent transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>삭제</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-secondary">
          첫 번째 댓글을 작성해보세요!
        </div>
      )}
    </div>
  )
}
