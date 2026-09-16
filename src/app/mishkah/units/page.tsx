'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Users, CalendarClock, Search } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Avatar, AvatarStack, Badge, Dot, EmptyState, SectionHeader, Tabs } from '@/mishkah/ui'
import { ar, teamKindLabels } from '@/mishkah/selectors'
import { formatDate, isThisWeek } from '@/mishkah/data/dates'

type Tab = 'units' | 'teams'

export default function UnitsPage() {
  const { units, teams, employees, posts, meetings } = useMishkah()
  const [tab, setTab] = useState<Tab>('units')
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<string>('all')

  const term = q.trim()
  const shownUnits = units.filter((u) => !term || u.name.includes(term) || u.about.includes(term))
  const shownTeams = teams.filter(
    (t) => (!term || t.name.includes(term)) && (kind === 'all' || (kind === 'archived' ? t.status === 'archived' : t.kind === kind && t.status === 'active')),
  )

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">إدارات وفرق مشكاة</h1>
        <p className="text-sm mk-muted mt-1">
          هيكل مرن قابل للتوسع — يمكن إضافة إدارات وفرق ولجان جديدة من لوحة مدير النظام.
        </p>
      </header>

      <div className="relative">
        <Search size={17} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: 'var(--mk-muted)' }} />
        <input className="mk-input mk-input-search" placeholder="ابحث عن إدارة أو فريق…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: 'units', label: 'الإدارات', count: units.length },
          { id: 'teams', label: 'الفرق واللجان', count: teams.length },
        ]}
      />

      {tab === 'units' && (
        <div className="grid sm:grid-cols-2 gap-3">
          {shownUnits.map((u) => {
            const manager = employees.find((e) => e.id === u.managerId)
            const members = employees.filter((e) => e.unitId === u.id)
            const lastPost = posts.find((p) => p.audience.kind === 'unit' && p.audience.ref === u.id)
            const nextMeeting = meetings.find((m) => m.unitId === u.id && isThisWeek(m.date))
            return (
              <Link key={u.id} href={`/mishkah/units/${u.id}`} className="mk-card mk-card-hover p-4 flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="mk-avatar" style={{ width: 40, height: 40, background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}>
                    <Building2 size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-6">{u.name}</p>
                    <p className="text-xs mk-muted mt-0.5">{manager?.name}</p>
                  </div>
                </div>
                <p className="text-sm mk-muted mt-3 leading-7 mk-clamp-2 flex-1">{u.about}</p>

                {u.tracks && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {u.tracks.map((t) => (
                      <Badge key={t.id} tone="var(--mk-gold-deep)">
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-3.5 pt-3 border-t" style={{ borderColor: 'var(--mk-line)' }}>
                  <AvatarStack people={members} max={4} size={26} />
                  <span className="text-xs mk-muted flex items-center gap-1">
                    <Users size={12} />
                    {ar(members.length)} أعضاء
                  </span>
                </div>

                {(lastPost || nextMeeting) && (
                  <div className="mt-2.5 text-xs mk-muted space-y-1">
                    {lastPost && <p className="mk-clamp-2">آخر خبر: {lastPost.body.slice(0, 70)}…</p>}
                    {nextMeeting && (
                      <p className="flex items-center gap-1">
                        <CalendarClock size={12} />
                        {nextMeeting.title} <Dot /> {formatDate(nextMeeting.date)}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {tab === 'teams' && (
        <>
          <div className="mk-scroll-x">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'permanent', label: 'فرق دائمة' },
              { id: 'committee', label: 'لجان مؤقتة' },
              { id: 'project', label: 'فرق مشاريع' },
              { id: 'interest', label: 'مجموعات اهتمام' },
              { id: 'archived', label: 'مؤرشفة' },
            ].map((k) => (
              <button key={k.id} type="button" className={`mk-chip ${kind === k.id ? 'mk-chip-active' : ''}`} onClick={() => setKind(k.id)}>
                {k.label}
              </button>
            ))}
          </div>

          {shownTeams.length === 0 ? (
            <EmptyState title="لا توجد فرق في هذا التصنيف" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {shownTeams.map((t) => {
                const lead = employees.find((e) => e.id === t.leadId)
                const members = employees.filter((e) => t.memberIds.includes(e.id))
                return (
                  <Link key={t.id} href={`/mishkah/teams/${t.id}`} className="mk-card mk-card-hover p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold leading-6">{t.name}</p>
                      <Badge tone={t.status === 'active' ? 'var(--mk-success)' : 'var(--mk-muted)'}>
                        {t.status === 'active' ? 'نشط' : 'مؤرشف'}
                      </Badge>
                    </div>
                    <p className="text-xs mk-muted mt-1">{teamKindLabels[t.kind]}</p>
                    <p className="text-sm mk-muted mt-2 leading-7 mk-clamp-2">{t.about}</p>
                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--mk-line)' }}>
                      <span className="flex items-center gap-2 min-w-0">
                        <Avatar person={lead} size={24} />
                        <span className="text-xs mk-muted truncate">القائد: {lead?.name}</span>
                      </span>
                      <span className="text-xs mk-muted shrink-0">{ar(members.length)} أعضاء</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}

      <SectionHeader title="هيكل مرن" />
      <p className="text-sm mk-muted leading-8 mk-card p-4">
        لا يرتبط النموذج بعدد ثابت من الإدارات؛ فكل إدارة تحمل مديرًا وأعضاء وخدمات وفرقًا تابعة، ويمكن استحداث
        إدارة أو فريق جديد دون تعديل برمجي — جرّب ذلك من لوحة مدير النظام.
      </p>
    </div>
  )
}
