'use client'

import Link from 'next/link'
import { Paperclip, Clock, AlertTriangle } from 'lucide-react'
import { useMishkah } from '../store'
import type { ServiceRequest } from '../types'
import { Avatar, Dot, Progress, StatusBadge } from '../ui'
import { ar, statusLabels, statusProgress, statusTones } from '../selectors'
import { relativeTime, formatDate } from '../data/dates'

export type ViewMode = 'cards' | 'list' | 'table'

/** تنبيه المدة المتبقية */
export function DueHint({ request }: { request: ServiceRequest }) {
  if (['completed', 'rejected', 'draft'].includes(request.status)) {
    return <span className="text-xs mk-muted">المدة المستهدفة {ar(request.dueDays)} أيام</span>
  }
  if (request.daysLeft < 0) {
    return (
      <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--mk-danger)' }}>
        <AlertTriangle size={12} />
        متأخر {ar(Math.abs(request.daysLeft))} يوم
      </span>
    )
  }
  return (
    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--mk-warning)' }}>
      <Clock size={12} />
      متبقٍ {ar(request.daysLeft)} يوم
    </span>
  )
}

export function RequestList({ requests, mode }: { requests: ServiceRequest[]; mode: ViewMode }) {
  const { services, employees } = useMishkah()

  if (mode === 'table') {
    return (
      <div className="mk-card overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '44rem' }}>
          <thead>
            <tr style={{ background: 'var(--mk-primary-tint)' }}>
              {['رقم الطلب', 'الخدمة', 'تاريخ التقديم', 'الحالة', 'المسؤول الحالي', 'آخر تحديث'].map((h) => (
                <th key={h} className="text-right font-bold px-3.5 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const svc = services.find((s) => s.id === r.serviceId)
              const owner = employees.find((e) => e.id === r.currentOwnerId)
              return (
                <tr key={r.id} className="border-t" style={{ borderColor: 'var(--mk-line)' }}>
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <Link href={`/mishkah/office/requests/${r.id}`} className="mk-link">
                      {r.ref}
                    </Link>
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap">{svc?.name}</td>
                  <td className="px-3.5 py-3 whitespace-nowrap mk-muted">{formatDate(r.createdAt.slice(0, 10))}</td>
                  <td className="px-3.5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap">{owner?.name}</td>
                  <td className="px-3.5 py-3 whitespace-nowrap mk-muted">{relativeTime(r.updatedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (mode === 'list') {
    return (
      <div className="mk-card divide-y" style={{ borderColor: 'var(--mk-line)' }}>
        {requests.map((r) => {
          const svc = services.find((s) => s.id === r.serviceId)
          return (
            <Link key={r.id} href={`/mishkah/office/requests/${r.id}`} className="flex items-center gap-3 px-4 py-3">
              <span className="mk-dot" style={{ background: statusTones[r.status] }} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold truncate">{svc?.name}</span>
                <span className="block text-xs mk-muted">
                  {r.ref} <Dot /> {relativeTime(r.updatedAt)}
                </span>
              </span>
              <span className="text-xs mk-muted shrink-0">{statusLabels[r.status]}</span>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {requests.map((r) => (
        <RequestCard key={r.id} request={r} />
      ))}
    </div>
  )
}

export function RequestCard({ request }: { request: ServiceRequest }) {
  const { services, employees } = useMishkah()
  const svc = services.find((s) => s.id === request.serviceId)
  const owner = employees.find((e) => e.id === request.currentOwnerId)

  return (
    <Link href={`/mishkah/office/requests/${request.id}`} className="mk-card mk-card-hover p-4 block">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-sm leading-6">{svc?.name}</p>
          <p className="text-xs mk-muted mt-0.5">{request.ref}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-3.5">
        <Progress value={statusProgress[request.status]} tone={statusTones[request.status]} />
      </div>

      <div className="flex items-center justify-between gap-2 mt-3">
        <span className="flex items-center gap-1.5 text-xs mk-muted min-w-0">
          <Avatar person={owner} size={22} />
          <span className="truncate">{owner?.name}</span>
        </span>
        <DueHint request={request} />
      </div>

      <div className="flex items-center gap-3 mt-2.5 text-xs mk-muted">
        <span>قُدّم {relativeTime(request.createdAt)}</span>
        {request.attachments.length > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip size={12} />
            {ar(request.attachments.length)}
          </span>
        )}
      </div>
    </Link>
  )
}
