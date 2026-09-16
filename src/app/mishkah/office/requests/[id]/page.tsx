'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowRight,
  Paperclip,
  Check,
  X,
  RotateCcw,
  Forward,
  MessageSquarePlus,
  PlayCircle,
  CheckCircle2,
  Download,
} from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Avatar, Dot, EmptyState, InfoRow, Modal, Progress, StatusBadge } from '@/mishkah/ui'
import { DueHint } from '@/mishkah/components/RequestViews'
import { ar, formatFieldValue, statusProgress, statusTones } from '@/mishkah/selectors'
import { formatDate, formatTime, relativeTime } from '@/mishkah/data/dates'

type ActionKind = 'approve' | 'reject' | 'return' | 'forward' | 'note' | 'progress' | 'close'

const actionMeta: Record<ActionKind, { label: string; needsNote: boolean; tone: string; icon: React.ElementType }> = {
  approve: { label: 'اعتماد الطلب', needsNote: false, tone: 'var(--mk-success)', icon: Check },
  reject: { label: 'رفض مع ذكر السبب', needsNote: true, tone: 'var(--mk-danger)', icon: X },
  return: { label: 'إعادة للاستكمال', needsNote: true, tone: 'var(--mk-warning)', icon: RotateCcw },
  forward: { label: 'تحويل الطلب', needsNote: false, tone: 'var(--mk-info)', icon: Forward },
  note: { label: 'إضافة ملاحظة', needsNote: true, tone: 'var(--mk-muted)', icon: MessageSquarePlus },
  progress: { label: 'بدء التنفيذ', needsNote: false, tone: 'var(--mk-info)', icon: PlayCircle },
  close: { label: 'إغلاق الطلب', needsNote: false, tone: 'var(--mk-primary)', icon: CheckCircle2 },
}

export default function RequestPage() {
  const params = useParams<{ id: string }>()
  const { requests, services, employees, currentUser, actOnRequest, toast } = useMishkah()
  const [action, setAction] = useState<ActionKind | null>(null)
  const [note, setNote] = useState('')
  const [forwardTo, setForwardTo] = useState('')
  const [busy, setBusy] = useState(false)

  const request = requests.find((r) => r.id === params.id)
  if (!request) {
    return (
      <EmptyState
        title="الطلب غير موجود"
        action={
          <Link href="/mishkah/office" className="mk-link mt-2">
            العودة إلى مكتبي
          </Link>
        }
      />
    )
  }

  const service = services.find((s) => s.id === request.serviceId)
  const requester = employees.find((e) => e.id === request.requesterId)
  const owner = employees.find((e) => e.id === request.currentOwnerId)
  const isOwner = request.currentOwnerId === currentUser.id
  const isRequester = request.requesterId === currentUser.id
  const closed = ['completed', 'rejected'].includes(request.status)

  const available: ActionKind[] = closed
    ? []
    : isOwner
      ? request.status === 'approved' || request.status === 'in_progress'
        ? ['progress', 'close', 'note', 'forward', 'reject']
        : ['approve', 'return', 'reject', 'forward', 'note']
      : isRequester && request.status === 'returned'
        ? ['note']
        : []

  function confirmAction() {
    if (!action) return
    if (actionMeta[action].needsNote && !note.trim()) return
    setBusy(true)
    setTimeout(() => {
      actOnRequest(request!.id, action, note.trim() || undefined, forwardTo || undefined)
      setBusy(false)
      setAction(null)
      setNote('')
      setForwardTo('')
    }, 700)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Link href="/mishkah/office" className="mk-link text-sm inline-flex items-center gap-1">
        <ArrowRight size={14} />
        مكتبي
      </Link>

      <div className="mk-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold">{service?.name}</h1>
            <p className="text-sm mk-muted mt-0.5">{request.ref}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mk-muted mb-1.5">
            <span>نسبة التقدم</span>
            <span>{ar(statusProgress[request.status])}٪</span>
          </div>
          <Progress value={statusProgress[request.status]} tone={statusTones[request.status]} />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-x-6">
          <InfoRow label="مقدّم الطلب" value={requester?.name ?? '—'} />
          <InfoRow label="المسؤول الحالي" value={owner?.name ?? '—'} />
          <InfoRow label="تاريخ التقديم" value={formatDate(request.createdAt.slice(0, 10))} />
          <InfoRow label="آخر تحديث" value={relativeTime(request.updatedAt)} />
          <InfoRow label="المدة المستهدفة" value={`${ar(request.dueDays)} أيام عمل`} />
          <InfoRow label="المتبقي" value={<DueHint request={request} />} />
        </div>
      </div>

      {/* تفاصيل الطلب */}
      <div className="mk-card p-5">
        <h2 className="mk-section-title mb-2">تفاصيل الطلب</h2>
        {service?.form
          .filter((f) => f.type !== 'file' && (request.values[f.key] ?? '').trim())
          .map((f) => (
            <InfoRow
              key={f.key}
              label={f.label}
              value={formatFieldValue(f.type, request.values[f.key], { date: formatDate, time: formatTime })}
            />
          ))}
      </div>

      {/* المرفقات */}
      <div className="mk-card p-5">
        <h2 className="mk-section-title mb-3">المرفقات</h2>
        {request.attachments.length === 0 ? (
          <p className="text-sm mk-muted">لا توجد مرفقات.</p>
        ) : (
          <ul className="space-y-2">
            {request.attachments.map((a) => (
              <li
                key={a.name}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm"
                style={{ background: 'var(--mk-primary-tint)' }}
              >
                <Paperclip size={15} style={{ color: 'var(--mk-primary)' }} />
                <span className="flex-1 truncate font-semibold">{a.name}</span>
                <span className="text-xs mk-muted">{a.size}</span>
                <button
                  type="button"
                  className="mk-btn mk-btn-ghost mk-btn-sm"
                  onClick={() => toast('هذه نسخة تجريبية — الملف غير متاح للتنزيل', 'info')}
                  aria-label="تنزيل"
                >
                  <Download size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* سجل الإجراءات */}
      <div className="mk-card p-5">
        <h2 className="mk-section-title mb-4">سجل الإجراءات</h2>
        <ol className="space-y-4">
          {request.timeline.map((ev, i) => {
            const actor = employees.find((e) => e.id === ev.actorId)
            const last = i === request.timeline.length - 1
            return (
              <li key={`${ev.at}-${i}`} className="flex gap-3">
                <span className="flex flex-col items-center">
                  <Avatar person={actor} size={30} />
                  {!last && <span className="flex-1 w-px my-1" style={{ background: 'var(--mk-line)' }} />}
                </span>
                <span className="pb-1 min-w-0">
                  <span className="block text-sm font-semibold">{ev.action}</span>
                  <span className="block text-xs mk-muted mt-0.5">
                    {actor?.name} <Dot /> {relativeTime(ev.at)}
                  </span>
                  {ev.note && (
                    <span
                      className="block text-sm mt-1.5 rounded-xl px-3 py-2 leading-7"
                      style={{ background: 'var(--mk-primary-tint)' }}
                    >
                      {ev.note}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {/* الإجراءات */}
      {available.length > 0 && (
        <div className="mk-card p-5 sticky bottom-20 lg:bottom-4" style={{ background: 'var(--mk-surface)' }}>
          <h2 className="mk-section-title mb-3">الإجراءات المتاحة لك</h2>
          <div className="flex flex-wrap gap-2">
            {available.map((a) => {
              const meta = actionMeta[a]
              return (
                <button
                  key={a}
                  type="button"
                  className="mk-btn mk-btn-sm"
                  style={{
                    background: `color-mix(in srgb, ${meta.tone} 12%, #fff)`,
                    color: meta.tone,
                    borderColor: `color-mix(in srgb, ${meta.tone} 26%, #fff)`,
                  }}
                  onClick={() => {
                    setAction(a)
                    setNote('')
                  }}
                >
                  <meta.icon size={15} />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {closed && (
        <p className="text-sm mk-muted text-center py-2">هذا الطلب مغلق ولا توجد إجراءات متاحة عليه.</p>
      )}

      {/* نافذة تأكيد الإجراء */}
      <Modal
        open={action !== null}
        onClose={() => setAction(null)}
        title={action ? actionMeta[action].label : ''}
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={() => setAction(null)}>
              إلغاء
            </button>
            <button
              type="button"
              className="mk-btn mk-btn-primary"
              onClick={confirmAction}
              disabled={busy || (action !== null && actionMeta[action].needsNote && !note.trim()) || (action === 'forward' && !forwardTo)}
            >
              {busy && <span className="mk-spinner" />}
              {busy ? 'جارٍ التنفيذ…' : 'تأكيد'}
            </button>
          </>
        }
      >
        <p className="text-sm mk-muted leading-7 mb-4">
          {action === 'approve' && 'سيُعتمد الطلب وينتقل إلى مرحلة التنفيذ، ويصل إشعار لمقدّم الطلب.'}
          {action === 'reject' && 'وضّح سبب الرفض ليصل لمقدّم الطلب بوضوح.'}
          {action === 'return' && 'سيعود الطلب إلى مقدّمه لاستكمال ما ينقصه.'}
          {action === 'forward' && 'اختر الزميل الذي سيُحوّل إليه الطلب لمتابعته.'}
          {action === 'note' && 'تُضاف الملاحظة إلى سجل الإجراءات دون تغيير حالة الطلب.'}
          {action === 'progress' && 'سيُعلّم الطلب بأنه قيد التنفيذ الآن.'}
          {action === 'close' && 'سيُغلق الطلب ويُعلّم بأنه مكتمل.'}
        </p>

        {action === 'forward' && (
          <div className="mb-4">
            <label className="mk-label">تحويل إلى</label>
            <select className="mk-select" value={forwardTo} onChange={(e) => setForwardTo(e.target.value)}>
              <option value="">اختر الزميل…</option>
              {employees
                .filter((e) => e.id !== currentUser.id)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.title}
                  </option>
                ))}
            </select>
          </div>
        )}

        <label className="mk-label">
          ملاحظة {action && actionMeta[action].needsNote ? <span style={{ color: 'var(--mk-danger)' }}>*</span> : '(اختياري)'}
        </label>
        <textarea className="mk-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="اكتب ملاحظتك…" />
      </Modal>
    </div>
  )
}
