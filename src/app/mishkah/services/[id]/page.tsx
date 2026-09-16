'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, Clock, Building2, UserCheck, ListChecks, Workflow } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { RequestForm } from '@/mishkah/components/RequestForm'
import { Avatar, CheckLine, EmptyState, Modal } from '@/mishkah/ui'
import { categoryLabels, ar } from '@/mishkah/selectors'

export default function ServicePage() {
  const params = useParams<{ id: string }>()
  const { services, units, employees } = useMishkah()
  const [open, setOpen] = useState(false)
  const service = services.find((s) => s.id === params.id)

  if (!service) {
    return <EmptyState title="الخدمة غير موجودة" action={<Link href="/mishkah/services" className="mk-link mt-2">العودة لدليل الخدمات</Link>} />
  }

  const unit = units.find((u) => u.id === service.ownerUnitId)
  const owner = employees.find((e) => e.id === service.ownerId)

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/mishkah/services" className="mk-link text-sm inline-flex items-center gap-1">
        <ArrowRight size={14} />
        دليل الخدمات
      </Link>

      <div className="mk-card p-5">
        <span className="mk-badge" style={{ background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}>
          {categoryLabels[service.category]}
        </span>
        <h1 className="text-xl font-bold mt-2.5">{service.name}</h1>
        <p className="text-sm mk-muted mt-2 leading-8">{service.description}</p>

        <div className="grid sm:grid-cols-3 gap-2.5 mt-5">
          <Tile icon={<Building2 size={15} />} label="الجهة المسؤولة" value={unit?.name ?? '—'} />
          <Tile icon={<Clock size={15} />} label="المدة المتوقعة" value={`${ar(service.slaDays)} أيام عمل`} />
          <Tile icon={<UserCheck size={15} />} label="من يحق له الطلب" value={service.eligibility} />
        </div>

        <div className="mt-5">
          <p className="mk-section-title mb-2">
            <ListChecks size={15} style={{ color: 'var(--mk-primary)' }} />
            المتطلبات والمرفقات
          </p>
          <ul className="space-y-1.5">
            {service.requirements.map((r) => (
              <CheckLine key={r}>{r}</CheckLine>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="mk-section-title mb-2">
            <Workflow size={15} style={{ color: 'var(--mk-primary)' }} />
            مسار الاعتماد
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {service.approvalChain.map((stepName, i) => (
              <span key={stepName} className="flex items-center gap-2">
                <span className="mk-badge" style={{ background: 'var(--mk-primary-tint)', color: 'var(--mk-ink)' }}>
                  {ar(i + 1)}. {stepName}
                </span>
                {i < service.approvalChain.length - 1 && <span className="mk-muted text-xs">←</span>}
              </span>
            ))}
          </div>
        </div>

        {owner && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl p-3" style={{ background: 'var(--mk-primary-tint)' }}>
            <Avatar person={owner} size={38} />
            <div className="min-w-0">
              <p className="text-xs mk-muted">مسؤول الخدمة</p>
              <Link href={`/mishkah/directory/${owner.id}`} className="text-sm font-bold hover:underline">
                {owner.name}
              </Link>
            </div>
          </div>
        )}

        <button type="button" className="mk-btn mk-btn-primary mk-btn-lg mt-5" onClick={() => setOpen(true)}>
          ابدأ الخدمة
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={service.name}>
        <RequestForm service={service} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  )
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: 'var(--mk-primary-tint)' }}>
      <p className="text-xs mk-muted flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-sm font-bold mt-1 leading-6">{value}</p>
    </div>
  )
}
