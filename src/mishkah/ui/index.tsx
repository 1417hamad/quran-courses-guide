'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { X, Check, Info, TriangleAlert, CircleCheck, Search } from 'lucide-react'
import { brand } from '../brand'
import type { Employee, RequestStatus, Toast } from '../types'
import { ar, statusLabels, statusTones } from '../selectors'

/* ————————————————————————— الشعار ————————————————————————— */

/**
 * شعار مشكاة.
 * يستخدم الملف الرسمي تلقائيًا إذا وُضع في `public/mishkah/logo.svg` (المسار في brand.logoSrc)،
 * وإن لم يوجد يعرض الكلمة الكتابية «مشكاة» دون اختراع شعار بديل.
 */
export function Logo({ size = 40, withText = true, light = false }: { size?: number; withText?: boolean; light?: boolean }) {
  const [fileOk, setFileOk] = useState(true)
  const useFile = Boolean(brand.logoSrc) && fileOk

  return (
    <span className="flex items-center gap-2.5">
      {useFile ? (
        /* eslint-disable-next-line @next/next/no-img-element -- ملف الشعار يوضع من قِبل المركز وقد لا يكون موجودًا */
        <img
          src={brand.logoSrc}
          alt={brand.orgName}
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: 'contain' }}
          onError={() => setFileOk(false)}
        />
      ) : (
        <span
          className="mk-avatar"
          style={{
            width: size,
            height: size,
            background: light ? 'rgba(255,255,255,0.14)' : 'var(--mk-primary)',
            fontSize: size * 0.34,
            borderRadius: size * 0.34,
          }}
          aria-hidden
        >
          <LampMark size={size * 0.56} />
        </span>
      )}
      {withText && (
        <span className="leading-tight">
          <span
            className="block font-bold"
            style={{ color: light ? '#fff' : 'var(--mk-ink)', fontSize: size * 0.4 }}
          >
            {brand.shortName}
          </span>
          <span
            className="block"
            style={{ color: light ? 'rgba(255,255,255,0.72)' : 'var(--mk-muted)', fontSize: size * 0.26 }}
          >
            بيئة رقمية
          </span>
        </span>
      )}
    </span>
  )
}

/** علامة المشكاة المجرّدة (تُستبدل بملف الشعار الرسمي عند توفره) */
function LampMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 3h8l-1.6 4.2a4.6 4.6 0 1 1-4.8 0L8 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12.2" r="1.7" fill="currentColor" />
      <path d="M12 17.6V21M9 21h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* ————————————————————————— الصور الرمزية ————————————————————————— */

export function Avatar({ person, size = 40 }: { person: Employee | undefined; size?: number }) {
  if (!person) return null
  return (
    <span
      className="mk-avatar"
      style={{ width: size, height: size, background: person.tone, fontSize: size * 0.33 }}
      title={person.name}
    >
      {person.initials}
    </span>
  )
}

export function AvatarStack({ people, max = 4, size = 28 }: { people: Employee[]; max?: number; size?: number }) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <span className="flex items-center">
      {shown.map((p, i) => (
        <span key={p.id} style={{ marginInlineStart: i === 0 ? 0 : -size * 0.3 }}>
          <span style={{ display: 'inline-block', border: '2px solid var(--mk-surface)', borderRadius: 999 }}>
            <Avatar person={p} size={size} />
          </span>
        </span>
      ))}
      {rest > 0 && (
        <span
          className="mk-avatar"
          style={{
            width: size,
            height: size,
            background: 'var(--mk-primary-soft)',
            color: 'var(--mk-primary)',
            fontSize: size * 0.34,
            marginInlineStart: -size * 0.3,
            border: '2px solid var(--mk-surface)',
          }}
        >
          +{rest}
        </span>
      )}
    </span>
  )
}

/* ————————————————————————— وسوم وحالات ————————————————————————— */

export function Badge({ children, tone = 'var(--mk-muted)', soft = true }: { children: ReactNode; tone?: string; soft?: boolean }) {
  return (
    <span
      className="mk-badge"
      style={
        soft
          ? { background: `color-mix(in srgb, ${tone} 12%, #fff)`, color: tone }
          : { background: tone, color: '#fff' }
      }
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const tone = statusTones[status]
  return (
    <span className="mk-badge" style={{ background: `color-mix(in srgb, ${tone} 12%, #fff)`, color: tone }}>
      <span className="mk-dot" style={{ background: tone }} />
      {statusLabels[status]}
    </span>
  )
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button type="button" className={`mk-chip ${active ? 'mk-chip-active' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

/* ————————————————————————— عناوين وأقسام ————————————————————————— */

export function SectionHeader({
  title,
  action,
  icon,
}: {
  title: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="mk-section-title">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  )
}

export function EmptyState({ title, note, icon, action }: { title: string; note?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mk-card p-8 text-center flex flex-col items-center gap-2">
      <span
        className="mk-avatar mb-1"
        style={{ width: 52, height: 52, background: 'var(--mk-primary-tint)', color: 'var(--mk-primary)' }}
      >
        {icon ?? <Search size={22} />}
      </span>
      <p className="font-bold">{title}</p>
      {note && <p className="text-sm mk-muted max-w-sm">{note}</p>}
      {action}
    </div>
  )
}

/* ————————————————————————— النوافذ ————————————————————————— */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="mk-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="mk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--mk-line)' }}>
          <h3 className="font-bold">{title}</h3>
          <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={onClose} aria-label="إغلاق">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t flex gap-2 justify-end" style={{ borderColor: 'var(--mk-line)', background: 'var(--mk-primary-tint)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/** نافذة تأكيد مختصرة */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'تأكيد',
  tone = 'primary',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  tone?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button type="button" className="mk-btn mk-btn-ghost" onClick={onCancel}>
            إلغاء
          </button>
          <button
            type="button"
            className={`mk-btn ${tone === 'danger' ? 'mk-btn-danger' : 'mk-btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-8 mk-muted">{message}</p>
    </Modal>
  )
}

/* ————————————————————————— التنبيهات ————————————————————————— */

export function ToastHost({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const icons = {
    success: <CircleCheck size={16} />,
    info: <Info size={16} />,
    warn: <TriangleAlert size={16} />,
    danger: <TriangleAlert size={16} />,
  }
  const tones = {
    success: 'var(--mk-primary)',
    info: 'var(--mk-info)',
    warn: 'var(--mk-warning)',
    danger: 'var(--mk-danger)',
  }
  return (
    <div className="mk-toasts">
      {toasts.map((t) => (
        <div key={t.id} className="mk-toast" style={{ background: tones[t.tone] }} onClick={() => onDismiss(t.id)}>
          {icons[t.tone]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

/* ————————————————————————— أدوات مساعدة ————————————————————————— */

/** فاصل «·» بين أجزاء السطر الواحد */
export function Dot() {
  return <span className="mk-sep">·</span>
}

export function Progress({ value, tone = 'var(--mk-primary)' }: { value: number; tone?: string }) {
  return (
    <div className="mk-progress">
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: tone }} />
    </div>
  )
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string; count?: number }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="mk-scroll-x gap-4 border-b" style={{ borderColor: 'var(--mk-line)' }}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`mk-tab ${value === it.id ? 'mk-tab-active' : ''}`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
          {it.count !== undefined && <span className="mk-muted"> ({ar(it.count)})</span>}
        </button>
      ))}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`mk-skeleton ${className}`} />
}

export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check size={15} className="mt-1 shrink-0" style={{ color: 'var(--mk-primary)' }} />
      <span>{children}</span>
    </li>
  )
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm border-b last:border-0" style={{ borderColor: 'var(--mk-line)' }}>
      <span className="mk-muted shrink-0">{label}</span>
      <span className="font-semibold text-left" style={{ textAlign: 'start' }}>
        {value}
      </span>
    </div>
  )
}
