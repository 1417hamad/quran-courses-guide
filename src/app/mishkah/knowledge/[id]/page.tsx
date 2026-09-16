'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, Star, CheckCircle2, Download, History, Users, ShieldCheck } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { docTypeLabels } from '@/mishkah/data'
import { Avatar, Badge, EmptyState, InfoRow, Modal, SectionHeader } from '@/mishkah/ui'
import { ar, hasRole } from '@/mishkah/selectors'
import { formatDate } from '@/mishkah/data/dates'

export default function DocumentPage() {
  const params = useParams<{ id: string }>()
  const { documents, units, employees, currentUser, acknowledgeDoc, toggleFavoriteDoc, toast } = useMishkah()
  const [ackOpen, setAckOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const doc = documents.find((d) => d.id === params.id)
  if (!doc) {
    return <EmptyState title="الوثيقة غير موجودة" action={<Link href="/mishkah/knowledge" className="mk-link mt-2">العودة للمكتبة</Link>} />
  }

  const unit = units.find((u) => u.id === doc.ownerUnitId)
  const acked = doc.ackByIds.includes(currentUser.id)
  const ackPeople = employees.filter((e) => doc.ackByIds.includes(e.id))
  const canSeeLog = hasRole(currentUser, 'unit_manager') || hasRole(currentUser, 'executive') || hasRole(currentUser, 'sysadmin')

  function confirmAck() {
    setBusy(true)
    setTimeout(() => {
      acknowledgeDoc(doc!.id)
      setBusy(false)
      setAckOpen(false)
    }, 600)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Link href="/mishkah/knowledge" className="mk-link text-sm inline-flex items-center gap-1">
        <ArrowRight size={14} />
        معرفة مشكاة
      </Link>

      <article className="mk-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge tone="var(--mk-primary)">{docTypeLabels[doc.type]}</Badge>
              <Badge tone="var(--mk-muted)">إصدار {ar(doc.version)}</Badge>
              {doc.requiresAck && (
                <Badge tone={acked ? 'var(--mk-success)' : 'var(--mk-warning)'}>
                  {acked ? 'اطّلعت عليه' : 'يتطلب تأكيد الاطلاع'}
                </Badge>
              )}
            </div>
            <h1 className="text-lg font-bold leading-8">{doc.title}</h1>
          </div>
          <button
            type="button"
            className="mk-btn mk-btn-ghost mk-btn-sm shrink-0"
            onClick={() => toggleFavoriteDoc(doc.id)}
            aria-label="المفضلة"
            style={doc.favorite ? { color: 'var(--mk-gold-deep)', borderColor: 'var(--mk-gold-deep)' } : undefined}
          >
            <Star size={15} fill={doc.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <p className="text-sm mk-muted mt-3 leading-8">{doc.summary}</p>

        <div className="mt-4">
          <InfoRow label="الجهة المصدرة" value={doc.issuedBy} />
          <InfoRow label="الإدارة المالكة" value={unit?.name ?? '—'} />
          <InfoRow label="تاريخ الإصدار" value={formatDate(doc.issuedAt)} />
          {doc.effectiveAt && <InfoRow label="تاريخ السريان" value={formatDate(doc.effectiveAt)} />}
          <InfoRow label="الفئات المستهدفة" value={doc.audience.join('، ')} />
          <InfoRow label="عدد المشاهدات" value={`${ar(doc.views)} مشاهدة`} />
        </div>

        {doc.body && (
          <div className="mt-5">
            <SectionHeader title="نص الوثيقة" />
            <p className="text-sm mk-prewrap">{doc.body}</p>
          </div>
        )}

        {doc.fileName && (
          <button
            type="button"
            className="mk-btn mk-btn-soft mt-5"
            onClick={() => toast('هذه نسخة تجريبية — الملف غير متاح للتنزيل', 'info')}
          >
            <Download size={16} />
            {doc.fileName}
          </button>
        )}

        {doc.previousVersions.length > 0 && (
          <div className="mt-5">
            <SectionHeader title="الإصدارات السابقة" icon={<History size={15} />} />
            <ul className="space-y-2">
              {doc.previousVersions.map((v) => (
                <li key={v.version} className="flex items-center justify-between gap-3 text-sm rounded-xl px-3.5 py-2.5" style={{ background: 'var(--mk-primary-tint)' }}>
                  <span className="font-semibold">إصدار {ar(v.version)}</span>
                  <span className="text-xs mk-muted">{v.note}</span>
                  <span className="text-xs mk-muted shrink-0">{formatDate(v.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {/* تأكيد الاطلاع */}
      {doc.requiresAck && (
        <div className="mk-card p-5">
          <SectionHeader title="تأكيد الاطلاع" icon={<ShieldCheck size={16} style={{ color: 'var(--mk-primary)' }} />} />
          {acked ? (
            <p className="text-sm flex items-center gap-2" style={{ color: 'var(--mk-success)' }}>
              <CheckCircle2 size={17} />
              سُجّل اطلاعك على هذا القرار.
            </p>
          ) : (
            <>
              <p className="text-sm mk-muted leading-7 mb-3">
                يتطلب هذا القرار تأكيد اطلاعك عليه، ويُسجّل التأكيد باسمك وتاريخه لدى الجهة المخوّلة.
              </p>
              <button type="button" className="mk-btn mk-btn-primary" onClick={() => setAckOpen(true)}>
                <CheckCircle2 size={16} />
                اطلعت على القرار
              </button>
            </>
          )}

          {canSeeLog && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--mk-line)' }}>
              <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={() => setLogOpen(true)}>
                <Users size={14} />
                سجل الاطلاع ({ar(doc.ackByIds.length)})
              </button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={ackOpen}
        onClose={() => setAckOpen(false)}
        title="تأكيد الاطلاع على القرار"
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={() => setAckOpen(false)}>
              إلغاء
            </button>
            <button type="button" className="mk-btn mk-btn-primary" onClick={confirmAck} disabled={busy}>
              {busy && <span className="mk-spinner" />}
              {busy ? 'جارٍ التسجيل…' : 'نعم، اطلعت عليه'}
            </button>
          </>
        }
      >
        <p className="text-sm leading-8 mk-muted">
          بتأكيدك، يُسجّل اطلاعك على «{doc.title}» باسمك وتاريخ اليوم، ويظهر ذلك في سجل الاطلاع الخاص بالقرار.
        </p>
      </Modal>

      <Modal open={logOpen} onClose={() => setLogOpen(false)} title="سجل الاطلاع">
        {ackPeople.length === 0 ? (
          <p className="text-sm mk-muted">لم يسجّل أحد اطلاعه بعد.</p>
        ) : (
          <ul className="space-y-3">
            {ackPeople.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <Avatar person={p} size={34} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{p.name}</span>
                  <span className="block text-xs mk-muted truncate">{p.title}</span>
                </span>
                <CheckCircle2 size={16} className="mr-auto" style={{ color: 'var(--mk-success)' }} />
              </li>
            ))}
          </ul>
        )}
        <p className="mk-hint mt-4">
          اطّلع {ar(ackPeople.length)} من أصل {ar(employees.length)} موظفًا.
        </p>
      </Modal>
    </div>
  )
}
