'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  Bookmark,
  Paperclip,
  Globe2,
  Building2,
  Users,
  Lock,
  Send,
  Pin,
  FileText,
} from 'lucide-react'
import { useMishkah } from '../store'
import type { Post } from '../types'
import { Avatar, Badge, Dot } from '../ui'
import { postKindLabels, ar } from '../selectors'
import { relativeTime } from '../data/dates'
import { reactionEmojis } from '../data/posts'

const audienceIcon = {
  center: Globe2,
  unit: Building2,
  team: Users,
  people: Lock,
}

const kindTones: Record<Post['kind'], string> = {
  news: 'var(--mk-info)',
  announcement: 'var(--mk-primary)',
  congrats: 'var(--mk-gold)',
  poll: '#5B4B8A',
  photos: '#C05E4C',
  decision: 'var(--mk-danger)',
  knowledge: 'var(--mk-success)',
}

export function PostCard({ post }: { post: Post }) {
  const { employees, react, comment, vote, toggleSavePost, currentUser } = useMishkah()
  const [showComments, setShowComments] = useState(false)
  const [draft, setDraft] = useState('')
  const author = employees.find((e) => e.id === post.authorId)
  const AudIcon = audienceIcon[post.audience.kind]
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0)
  const totalVotes = post.poll?.options.reduce((a, o) => a + o.votes, 0) ?? 0

  return (
    <article className="mk-card p-4 sm:p-5">
      {post.pinned && (
        <p className="flex items-center gap-1.5 text-xs font-bold mb-2.5" style={{ color: 'var(--mk-gold)' }}>
          <Pin size={13} />
          منشور مثبّت
        </p>
      )}

      <header className="flex items-start gap-3">
        <Link href={`/mishkah/directory/${author?.id}`}>
          <Avatar person={author} size={42} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/mishkah/directory/${author?.id}`} className="font-bold text-sm hover:underline">
            {author?.name}
          </Link>
          <p className="text-xs mk-muted truncate">{author?.title}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs mk-muted">{relativeTime(post.createdAt)}</span>
            <Dot />
            <span className="text-xs mk-muted flex items-center gap-1">
              <AudIcon size={12} />
              {post.audience.label}
            </span>
          </div>
        </div>
        <Badge tone={kindTones[post.kind]}>{postKindLabels[post.kind]}</Badge>
      </header>

      <p className="mt-3.5 text-sm leading-8 mk-prewrap">{post.body}</p>

      {post.mentions && post.mentions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {post.mentions.map((id) => {
            const p = employees.find((e) => e.id === id)
            if (!p) return null
            return (
              <Link
                key={id}
                href={`/mishkah/directory/${id}`}
                className="mk-badge"
                style={{ background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}
              >
                @{p.name.split(' ')[0]} {p.name.split(' ').slice(-1)}
              </Link>
            )
          })}
        </div>
      )}

      {/* صور الفعالية */}
      {post.images && (
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          {post.images.map((img, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden flex items-end p-2 aspect-[4/3] mk-pattern"
              style={{ background: `color-mix(in srgb, ${img.tone} 18%, #fff)` }}
            >
              <span className="text-[0.65rem] font-bold" style={{ color: img.tone }}>
                {img.caption}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* مرفق */}
      {post.attachment && (
        <div
          className="mt-3.5 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm"
          style={{ background: 'var(--mk-primary-tint)' }}
        >
          <Paperclip size={15} style={{ color: 'var(--mk-primary)' }} />
          <span className="font-semibold flex-1 truncate">{post.attachment.name}</span>
          <span className="text-xs mk-muted">{post.attachment.size}</span>
        </div>
      )}

      {/* قرار مرتبط */}
      {post.decisionId && (
        <Link
          href={`/mishkah/knowledge/${post.decisionId}`}
          className="mt-3.5 flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm mk-card-hover mk-card"
        >
          <FileText size={16} style={{ color: 'var(--mk-danger)' }} />
          <span className="font-semibold flex-1">فتح صفحة القرار وتأكيد الاطلاع</span>
          <span className="mk-link text-xs">عرض ←</span>
        </Link>
      )}

      {/* استطلاع */}
      {post.poll && (
        <div className="mt-3.5 rounded-2xl p-3.5" style={{ background: 'var(--mk-primary-tint)' }}>
          <p className="text-sm font-bold mb-3">{post.poll.question}</p>
          <div className="space-y-2">
            {post.poll.options.map((opt) => {
              const pct = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0
              const mine = post.poll?.myVote === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => vote(post.id, opt.id)}
                  className="w-full text-right relative overflow-hidden rounded-xl border px-3.5 py-2.5 text-sm transition"
                  style={{
                    borderColor: mine ? 'var(--mk-primary)' : 'var(--mk-line)',
                    background: 'var(--mk-surface)',
                  }}
                >
                  <span
                    className="absolute inset-y-0 right-0 transition-all"
                    style={{
                      width: post.poll?.myVote ? `${pct}%` : '0%',
                      background: mine ? 'var(--mk-primary-soft)' : 'var(--mk-primary-tint)',
                    }}
                  />
                  <span className="relative flex items-center justify-between gap-2">
                    <span className="font-semibold">{opt.label}</span>
                    {post.poll?.myVote && <span className="text-xs mk-muted">{ar(pct)}٪</span>}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs mk-muted mt-2.5">
            {post.poll.myVote ? `شارك ${ar(totalVotes)} من الزملاء` : 'اختر إجابتك للمشاركة في الاستطلاع'}
          </p>
        </div>
      )}

      {/* التفاعل */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--mk-line)' }}>
        <div className="flex items-center gap-1">
          {reactionEmojis.map((emoji) => {
            const count = post.reactions[emoji] ?? 0
            const mine = post.myReaction === emoji
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => react(post.id, emoji)}
                className="mk-chip mk-btn-sm"
                style={
                  mine
                    ? { background: 'var(--mk-primary-soft)', borderColor: 'var(--mk-primary)', color: 'var(--mk-primary)' }
                    : undefined
                }
                aria-label={`تفاعل ${emoji}`}
              >
                <span>{emoji}</span>
                {count > 0 && <span className="text-xs">{ar(count)}</span>}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1">
          <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={() => setShowComments((v) => !v)}>
            <MessageCircle size={15} />
            {post.comments.length > 0 ? ar(post.comments.length) : 'تعليق'}
          </button>
          <button
            type="button"
            className="mk-btn mk-btn-ghost mk-btn-sm"
            onClick={() => toggleSavePost(post.id)}
            aria-label="حفظ المنشور"
            style={post.saved ? { color: 'var(--mk-gold)', borderColor: 'var(--mk-gold)' } : undefined}
          >
            <Bookmark size={15} fill={post.saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {totalReactions > 0 && !showComments && (
        <p className="text-xs mk-muted mt-2">تفاعل {ar(totalReactions)} من الزملاء مع هذا المنشور</p>
      )}

      {/* التعليقات */}
      {showComments && (
        <div className="mt-3.5 space-y-3">
          {post.comments.map((c) => {
            const a = employees.find((e) => e.id === c.authorId)
            return (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar person={a} size={30} />
                <div className="rounded-2xl px-3.5 py-2.5 flex-1" style={{ background: 'var(--mk-primary-tint)' }}>
                  <p className="text-xs font-bold">{a?.name}</p>
                  <p className="text-sm leading-7 mt-0.5">{c.body}</p>
                  <p className="text-[0.68rem] mk-muted mt-1">{relativeTime(c.at)}</p>
                </div>
              </div>
            )
          })}

          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!draft.trim()) return
              comment(post.id, draft.trim())
              setDraft('')
            }}
          >
            <Avatar person={currentUser} size={30} />
            <input
              className="mk-input"
              placeholder="اكتب تعليقًا…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="mk-btn mk-btn-primary mk-btn-sm" disabled={!draft.trim()} aria-label="إرسال">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </article>
  )
}
