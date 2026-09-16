'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, Video, CalendarDays, Users } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Badge, EmptyState } from '@/mishkah/ui'
import { ar, meetingKindLabels, meetingKindTones } from '@/mishkah/selectors'
import { formatDate, formatTime, isToday, isThisWeek, weekdayOf } from '@/mishkah/data/dates'

type Scope = 'all' | 'mine' | 'unit' | 'teams'

export default function CalendarPage() {
  const { meetings, currentUser } = useMishkah()
  const [scope, setScope] = useState<Scope>('all')
  const [kind, setKind] = useState<string>('all')

  const list = useMemo(() => {
    return [...meetings]
      .filter((m) => {
        const okScope =
          scope === 'all'
            ? true
            : scope === 'mine'
              ? m.inviteeIds.includes(currentUser.id)
              : scope === 'unit'
                ? m.unitId === currentUser.unitId
                : currentUser.teamIds.includes(m.teamId ?? '')
        const okKind = kind === 'all' || m.kind === kind
        return okScope && okKind
      })
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
  }, [meetings, scope, kind, currentUser])

  const groups = useMemo(() => {
    const today = list.filter((m) => isToday(m.date))
    const week = list.filter((m) => !isToday(m.date) && isThisWeek(m.date))
    const later = list.filter((m) => !isThisWeek(m.date) && m.date >= new Date().toISOString().slice(0, 10))
    const past = list.filter((m) => m.date < new Date().toISOString().slice(0, 10))
    return [
      { title: 'اليوم', items: today },
      { title: 'هذا الأسبوع', items: week },
      { title: 'لاحقًا', items: later },
      { title: 'لقاءات سابقة', items: past },
    ].filter((g) => g.items.length > 0)
  }, [list])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">التقويم واللقاءات</h1>
        <p className="text-sm mk-muted mt-1">
          تقويم موحّد يجمع لقاءات الموظفين واجتماعات الإدارات والفرق والورش والفعاليات والمواعيد النهائية.
        </p>
      </header>

      <div className="mk-scroll-x">
        {(
          [
            { id: 'all', label: 'كل اللقاءات' },
            { id: 'mine', label: 'لقاءاتي' },
            { id: 'unit', label: 'إدارتي' },
            { id: 'teams', label: 'فرقي' },
          ] as const
        ).map((s) => (
          <button key={s.id} type="button" className={`mk-chip ${scope === s.id ? 'mk-chip-active' : ''}`} onClick={() => setScope(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="mk-scroll-x">
        <button type="button" className={`mk-chip ${kind === 'all' ? 'mk-chip-active' : ''}`} onClick={() => setKind('all')}>
          كل الأنواع
        </button>
        {Object.entries(meetingKindLabels).map(([k, label]) => (
          <button key={k} type="button" className={`mk-chip ${kind === k ? 'mk-chip-active' : ''}`} onClick={() => setKind(k)}>
            {label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState title="لا توجد لقاءات مطابقة" icon={<CalendarDays size={22} />} />
      ) : (
        groups.map((g) => (
          <section key={g.title}>
            <h2 className="mk-section-title mb-2.5">{g.title}</h2>
            <div className="space-y-2.5">
              {g.items.map((m) => (
                <Link key={m.id} href={`/mishkah/calendar/${m.id}`} className="mk-card mk-card-hover p-4 flex items-start gap-3.5">
                  <span
                    className="rounded-xl px-3 py-2.5 text-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${meetingKindTones[m.kind]} 11%, #fff)`, color: meetingKindTones[m.kind] }}
                  >
                    <span className="block text-[0.68rem] font-bold">{weekdayOf(m.date)}</span>
                    <span className="block text-sm font-bold mt-0.5">{formatTime(m.start)}</span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge tone={meetingKindTones[m.kind]}>{meetingKindLabels[m.kind]}</Badge>
                      {m.myRsvp !== 'none' && (
                        <Badge tone={m.myRsvp === 'yes' ? 'var(--mk-success)' : 'var(--mk-muted)'}>
                          {m.myRsvp === 'yes' ? 'أكّدت الحضور' : 'اعتذرت'}
                        </Badge>
                      )}
                    </span>
                    <span className="block font-bold text-sm leading-6">{m.title}</span>
                    <span className="block text-xs mk-muted mt-1">{formatDate(m.date)}</span>
                    <span className="flex items-center gap-3 text-xs mk-muted mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        {m.onlineLink ? <Video size={12} /> : <MapPin size={12} />}
                        {m.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {ar(m.inviteeIds.length)} مدعو
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
