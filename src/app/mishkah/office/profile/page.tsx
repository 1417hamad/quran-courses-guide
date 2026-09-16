'use client'

import Link from 'next/link'
import { ArrowRight, Mail, Phone, Hash, CalendarDays, Building2 } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Avatar, Badge, InfoRow, SectionHeader } from '@/mishkah/ui'
import { roleNames, roleLabels, ar } from '@/mishkah/selectors'
import { formatDate } from '@/mishkah/data/dates'
import { platformLinks } from '@/mishkah/data'

export default function ProfilePage() {
  const { currentUser, units, teams } = useMishkah()
  const unit = units.find((u) => u.id === currentUser.unitId)
  const myTeams = teams.filter((t) => currentUser.teamIds.includes(t.id))

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/mishkah/office" className="mk-link text-sm inline-flex items-center gap-1">
        <ArrowRight size={14} />
        مكتبي
      </Link>

      <div className="mk-card p-5">
        <div className="flex items-center gap-4">
          <Avatar person={currentUser} size={68} />
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">{currentUser.name}</h1>
            <p className="text-sm mk-muted">{currentUser.title}</p>
            <p className="text-xs mk-muted mt-0.5 flex items-center gap-1">
              <Building2 size={12} />
              {unit?.name}
            </p>
          </div>
        </div>

        <p className="text-sm mk-muted leading-8 mt-4">{currentUser.bio}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {currentUser.expertise.map((e) => (
            <Badge key={e} tone="var(--mk-gold)">
              {e}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mk-card p-5">
        <SectionHeader title="بيانات التواصل" />
        <InfoRow label="البريد الإلكتروني" value={<span className="flex items-center gap-1.5"><Mail size={13} />{currentUser.email}</span>} />
        <InfoRow label="الجوال" value={<span className="flex items-center gap-1.5"><Phone size={13} />{currentUser.phone}</span>} />
        {currentUser.extension && (
          <InfoRow label="التحويلة" value={<span className="flex items-center gap-1.5"><Hash size={13} />{ar(currentUser.extension)}</span>} />
        )}
        <InfoRow label="أيام العمل" value={currentUser.workDays.join('، ')} />
        <InfoRow label="أوقات العمل" value={currentUser.workHours} />
        <InfoRow
          label="تاريخ الانضمام"
          value={<span className="flex items-center gap-1.5"><CalendarDays size={13} />{formatDate(currentUser.joinedAt)}</span>}
        />
      </div>

      <div className="mk-card p-5">
        <SectionHeader title="أدواري وصلاحياتي" />
        <div className="space-y-2">
          {currentUser.roles.map((r, i) => {
            const scopeName =
              r.scope === 'center'
                ? 'المركز كاملًا'
                : r.scope === 'unit'
                  ? units.find((u) => u.id === r.ref)?.name ?? 'إدارة'
                  : r.scope === 'team'
                    ? teams.find((t) => t.id === r.ref)?.name ?? 'فريق'
                    : 'خدمة محددة'
            return (
              <div key={i} className="flex items-center justify-between gap-3 text-sm rounded-xl px-3.5 py-2.5" style={{ background: 'var(--mk-primary-tint)' }}>
                <span className="font-semibold">{roleLabels[r.role]}</span>
                <span className="text-xs mk-muted">النطاق: {scopeName}</span>
              </div>
            )
          })}
        </div>
        <p className="mk-hint mt-3">
          الأدوار الحالية: {roleNames(currentUser).join('، ')}. يمكن للمستخدم امتلاك أكثر من دور بحسب السياق.
        </p>
      </div>

      <div className="mk-card p-5">
        <SectionHeader title="إدارتي وفرقي" />
        <div className="space-y-2">
          {unit && (
            <Link href={`/mishkah/units/${unit.id}`} className="mk-side-link">
              <Building2 size={16} />
              {unit.name}
            </Link>
          )}
          {myTeams.map((t) => (
            <Link key={t.id} href={`/mishkah/teams/${t.id}`} className="mk-side-link">
              {t.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mk-card p-5">
        <SectionHeader title="اختصاراتي" />
        <div className="grid sm:grid-cols-2 gap-2.5">
          {platformLinks.slice(0, 4).map((l) => (
            <a key={l.id} href={l.href} className="mk-card mk-card-hover p-3 flex items-center gap-2.5">
              <span className="mk-dot" style={{ background: l.tone, width: 9, height: 9 }} />
              <span className="text-sm font-semibold truncate">{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
