'use client'

import { useState } from 'react'
import { Image as ImageIcon, BarChart3, Paperclip, AtSign, X, Plus } from 'lucide-react'
import { useMishkah } from '../store'
import type { Audience, PostKind } from '../types'
import { Avatar, Modal } from '../ui'
import { postKindLabels } from '../selectors'

const kinds: PostKind[] = ['news', 'congrats', 'knowledge', 'announcement', 'poll', 'photos']

/** صندوق النشر على الحائط */
export function Composer() {
  const { currentUser, units, teams, employees, addPost } = useMishkah()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<PostKind>('news')
  const [body, setBody] = useState('')
  const [scope, setScope] = useState('center')
  const [mentions, setMentions] = useState<string[]>([])
  const [attachment, setAttachment] = useState<string | null>(null)
  const [pollQ, setPollQ] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [sending, setSending] = useState(false)

  const myUnit = units.find((u) => u.id === currentUser.unitId)
  const myTeams = teams.filter((t) => currentUser.teamIds.includes(t.id))

  function audienceOf(): Audience {
    if (scope === 'center') return { kind: 'center', label: 'لجميع موظفي المركز' }
    if (scope.startsWith('unit:')) {
      const u = units.find((x) => x.id === scope.slice(5))
      return { kind: 'unit', ref: u?.id, label: u?.name ?? 'إدارة' }
    }
    if (scope.startsWith('team:')) {
      const t = teams.find((x) => x.id === scope.slice(5))
      return { kind: 'team', ref: t?.id, label: t?.name ?? 'فريق' }
    }
    return { kind: 'people', label: 'لأشخاص محددين' }
  }

  function reset() {
    setBody('')
    setKind('news')
    setScope('center')
    setMentions([])
    setAttachment(null)
    setPollQ('')
    setPollOptions(['', ''])
  }

  function publish() {
    setSending(true)
    setTimeout(() => {
      addPost({
        body: body.trim(),
        kind,
        audience: audienceOf(),
        mentions: mentions.length ? mentions : undefined,
        attachment: attachment ? { name: attachment, size: '٣٢٠ ك.ب' } : undefined,
        poll:
          kind === 'poll' && pollQ.trim()
            ? { question: pollQ.trim(), options: pollOptions.filter((o) => o.trim()) }
            : undefined,
      })
      setSending(false)
      setOpen(false)
      reset()
    }, 600)
  }

  const valid = body.trim().length > 4 && (kind !== 'poll' || (pollQ.trim() && pollOptions.filter((o) => o.trim()).length >= 2))

  return (
    <>
      <div className="mk-card p-3.5 flex items-center gap-3">
        <Avatar person={currentUser} size={38} />
        <button
          type="button"
          className="mk-input text-right mk-muted flex-1"
          onClick={() => setOpen(true)}
        >
          شارك خبرًا أو فائدة مع زملائك…
        </button>
        <button type="button" className="mk-btn mk-btn-soft mk-btn-sm" onClick={() => { setKind('poll'); setOpen(true) }} aria-label="استطلاع">
          <BarChart3 size={16} />
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="مشاركة جديدة"
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={() => setOpen(false)}>
              إلغاء
            </button>
            <button type="button" className="mk-btn mk-btn-primary" disabled={!valid || sending} onClick={publish}>
              {sending && <span className="mk-spinner" />}
              {sending ? 'جارٍ النشر…' : 'نشر'}
            </button>
          </>
        }
      >
        <div className="flex items-center gap-3 mb-4">
          <Avatar person={currentUser} size={40} />
          <div>
            <p className="font-bold text-sm">{currentUser.name}</p>
            <p className="text-xs mk-muted">{currentUser.title}</p>
          </div>
        </div>

        <label className="mk-label">نوع المشاركة</label>
        <div className="mk-scroll-x mb-4">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              className={`mk-chip ${kind === k ? 'mk-chip-active' : ''}`}
              onClick={() => setKind(k)}
            >
              {postKindLabels[k]}
            </button>
          ))}
        </div>

        <label className="mk-label" htmlFor="mk-post-body">
          نص المشاركة
        </label>
        <textarea
          id="mk-post-body"
          className="mk-textarea"
          placeholder="اكتب ما تودّ مشاركته…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        {kind === 'poll' && (
          <div className="mt-4 rounded-2xl p-3.5" style={{ background: 'var(--mk-primary-tint)' }}>
            <label className="mk-label">سؤال الاستطلاع</label>
            <input className="mk-input" value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="مثال: ما الموعد الأنسب للورشة؟" />
            <label className="mk-label mt-3">الخيارات</label>
            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="mk-input"
                    value={opt}
                    placeholder={`الخيار ${i + 1}`}
                    onChange={(e) => setPollOptions(pollOptions.map((o, j) => (j === i ? e.target.value : o)))}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      className="mk-btn mk-btn-ghost mk-btn-sm"
                      onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                      aria-label="حذف الخيار"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 5 && (
              <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm mt-2" onClick={() => setPollOptions([...pollOptions, ''])}>
                <Plus size={14} />
                إضافة خيار
              </button>
            )}
          </div>
        )}

        <label className="mk-label mt-4">نطاق الظهور</label>
        <select className="mk-select" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="center">لجميع موظفي المركز</option>
          {myUnit && <option value={`unit:${myUnit.id}`}>إدارتي — {myUnit.name}</option>}
          {myTeams.map((t) => (
            <option key={t.id} value={`team:${t.id}`}>
              فريقي — {t.name}
            </option>
          ))}
          <option value="people">لأشخاص محددين</option>
        </select>

        <label className="mk-label mt-4">
          <AtSign size={13} className="inline ml-1" />
          الإشارة إلى زميل
        </label>
        <div className="mk-scroll-x">
          {employees.slice(0, 8).map((e) => (
            <button
              key={e.id}
              type="button"
              className={`mk-chip ${mentions.includes(e.id) ? 'mk-chip-active' : ''}`}
              onClick={() =>
                setMentions((m) => (m.includes(e.id) ? m.filter((x) => x !== e.id) : [...m, e.id]))
              }
            >
              {e.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="mk-btn mk-btn-ghost mk-btn-sm"
            onClick={() => setAttachment('صورة-من-الفعالية.jpg')}
          >
            <ImageIcon size={15} />
            إضافة صورة
          </button>
          <button
            type="button"
            className="mk-btn mk-btn-ghost mk-btn-sm"
            onClick={() => setAttachment('ملف-مرفق.pdf')}
          >
            <Paperclip size={15} />
            إرفاق ملف
          </button>
        </div>
        {attachment && (
          <p className="mk-hint flex items-center gap-2 mt-2">
            <Paperclip size={13} />
            {attachment}
            <button type="button" className="mk-link" onClick={() => setAttachment(null)}>
              إزالة
            </button>
          </p>
        )}
      </Modal>
    </>
  )
}
