'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock,
  FileText,
  Inbox,
  Sparkles,
  UserPlus,
  Trophy,
  ArrowLeft,
  MapPin,
  Video,
} from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Composer } from '@/mishkah/components/Composer'
import { PostCard } from '@/mishkah/components/PostCard'
import { Avatar, AvatarStack, Badge, Dot, EmptyState, SectionHeader } from '@/mishkah/ui'
import { ar, statusLabels } from '@/mishkah/selectors'
import { formatDate, formatTime, isToday, isThisWeek, weekdayOf } from '@/mishkah/data/dates'

type FeedFilter = 'all' | 'unit' | 'teams' | 'official' | 'celebration'

const filters: { id: FeedFilter; label: string }[] = [
  { id: 'all', label: 'جميع المركز' },
  { id: 'unit', label: 'إدارتي' },
  { id: 'teams', label: 'فرقي ولجاني' },
  { id: 'official', label: 'الإعلانات الرسمية' },
  { id: 'celebration', label: 'المناسبات والتهاني' },
]

export default function CommunityPage() {
  const { currentUser, posts, meetings, requests, documents, employees, units, services } = useMishkah()
  const [filter, setFilter] = useState<FeedFilter>('all')

  const myUnit = units.find((u) => u.id === currentUser.unitId)

  const visiblePosts = useMemo(() => {
    const base = posts.filter((p) => {
      if (p.audience.kind === 'center' || p.audience.kind === 'people') return true
      if (p.audience.kind === 'unit') return p.audience.ref === currentUser.unitId
      if (p.audience.kind === 'team') return currentUser.teamIds.includes(p.audience.ref ?? '')
      return true
    })
    const filtered = base.filter((p) => {
      if (filter === 'all') return true
      if (filter === 'unit') return p.audience.kind === 'unit' && p.audience.ref === currentUser.unitId
      if (filter === 'teams') return p.audience.kind === 'team'
      if (filter === 'official') return p.kind === 'announcement' || p.kind === 'decision'
      return p.kind === 'congrats' || p.kind === 'photos'
    })
    return [...filtered].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  }, [posts, filter, currentUser])

  const todayMeetings = meetings.filter((m) => isToday(m.date))
  const weekMeetings = meetings.filter((m) => isThisWeek(m.date) && !isToday(m.date))
  const myOpenRequests = requests.filter((r) => r.requesterId === currentUser.id && !['completed', 'rejected', 'draft'].includes(r.status))
  const needsMyAction = requests.filter(
    (r) =>
      (r.currentOwnerId === currentUser.id && ['submitted', 'review', 'approved'].includes(r.status)) ||
      (r.requesterId === currentUser.id && r.status === 'returned'),
  )
  const pendingDecisions = documents.filter((d) => d.requiresAck && !d.ackByIds.includes(currentUser.id))
  const newcomers = employees.filter((e) => e.isNew)
  const popularServices = [...services].sort((a, b) => b.usageCount - a.usageCount).slice(0, 4)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'طاب يومك' : 'مساء الخير'

  return (
    <div className="space-y-5">
      {/* الترحيب */}
      <section
        className="rounded-3xl p-5 sm:p-6 mk-pattern"
        style={{ background: 'var(--mk-primary)', color: '#fff' }}
      >
        <div className="flex items-center gap-3.5">
          <Avatar person={currentUser} size={50} />
          <div className="min-w-0">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {greeting}
            </p>
            <h1 className="text-lg sm:text-xl font-bold truncate">{currentUser.name}</h1>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {currentUser.title} <Dot /> {myUnit?.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <SummaryTile value={todayMeetings.length} label="لقاء اليوم" href="/mishkah/calendar" />
          <SummaryTile value={needsMyAction.length} label="بانتظار إجراءك" href="/mishkah/office/inbox" />
          <SummaryTile value={pendingDecisions.length} label="قرار للاطلاع" href="/mishkah/knowledge" />
        </div>
      </section>

      {/* اختصارات سريعة */}
      <section>
        <SectionHeader
          title="خدمات تستخدمها كثيرًا"
          icon={<Sparkles size={16} style={{ color: 'var(--mk-gold)' }} />}
          action={
            <Link href="/mishkah/services" className="mk-link text-xs">
              كل الخدمات ←
            </Link>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {popularServices.map((s) => (
            <Link key={s.id} href={`/mishkah/services/${s.id}`} className="mk-card mk-card-hover p-3.5">
              <p className="text-sm font-bold leading-6">{s.name}</p>
              <p className="text-xs mk-muted mt-1">خلال {ar(s.slaDays)} أيام عمل</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid xl:grid-cols-[1fr_20rem] gap-5 items-start">
        {/* العمود الرئيس: الحائط */}
        <div className="space-y-4 min-w-0">
          <Composer />

          <div className="mk-scroll-x">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`mk-chip ${filter === f.id ? 'mk-chip-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visiblePosts.length === 0 ? (
            <EmptyState title="لا توجد منشورات في هذا التصنيف" note="جرّب تصنيفًا آخر أو شارك أنت أول منشور." />
          ) : (
            <div className="space-y-4">
              {visiblePosts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>

        {/* العمود الجانبي */}
        <aside className="space-y-4 xl:sticky xl:top-24">
          {/* لقاءات اليوم والأسبوع */}
          <div className="mk-card p-4">
            <SectionHeader
              title="لقاءات اليوم والأسبوع"
              icon={<CalendarClock size={16} style={{ color: 'var(--mk-primary)' }} />}
              action={
                <Link href="/mishkah/calendar" className="mk-link text-xs">
                  التقويم ←
                </Link>
              }
            />
            {todayMeetings.length === 0 && weekMeetings.length === 0 ? (
              <p className="text-sm mk-muted">لا توجد لقاءات قريبة.</p>
            ) : (
              <div className="space-y-2.5">
                {[...todayMeetings, ...weekMeetings].slice(0, 4).map((m) => (
                  <Link key={m.id} href={`/mishkah/calendar/${m.id}`} className="block rounded-xl p-2.5 mk-card-hover" style={{ background: 'var(--mk-primary-tint)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge tone={isToday(m.date) ? 'var(--mk-gold)' : 'var(--mk-muted)'}>
                        {isToday(m.date) ? 'اليوم' : weekdayOf(m.date)}
                      </Badge>
                      <span className="text-xs mk-muted">{formatTime(m.start)}</span>
                    </div>
                    <p className="text-sm font-bold leading-6 mk-clamp-2">{m.title}</p>
                    <p className="text-xs mk-muted mt-1 flex items-center gap-1">
                      {m.onlineLink ? <Video size={12} /> : <MapPin size={12} />}
                      {m.location}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* القرارات الجديدة */}
          <div className="mk-card p-4">
            <SectionHeader title="القرارات الجديدة" icon={<FileText size={16} style={{ color: 'var(--mk-danger)' }} />} />
            <div className="space-y-2.5">
              {documents
                .filter((d) => d.type === 'decision' || d.type === 'circular')
                .slice(0, 3)
                .map((d) => {
                  const acked = d.ackByIds.includes(currentUser.id)
                  return (
                    <Link key={d.id} href={`/mishkah/knowledge/${d.id}`} className="block">
                      <p className="text-sm font-semibold leading-6 mk-clamp-2">{d.title}</p>
                      <p className="text-xs mk-muted mt-1 flex items-center gap-2">
                        {formatDate(d.issuedAt)}
                        {d.requiresAck && (
                          <Badge tone={acked ? 'var(--mk-success)' : 'var(--mk-warning)'}>
                            {acked ? 'اطّلعت' : 'يتطلب اطلاعك'}
                          </Badge>
                        )}
                      </p>
                    </Link>
                  )
                })}
            </div>
          </div>

          {/* طلبات تحتاج إجراءً */}
          <div className="mk-card p-4">
            <SectionHeader title="طلباتي المفتوحة" icon={<Inbox size={16} style={{ color: 'var(--mk-info)' }} />} />
            {myOpenRequests.length === 0 ? (
              <p className="text-sm mk-muted">لا توجد طلبات مفتوحة حاليًا.</p>
            ) : (
              <div className="space-y-2">
                {myOpenRequests.slice(0, 3).map((r) => {
                  const svc = services.find((s) => s.id === r.serviceId)
                  return (
                    <Link key={r.id} href={`/mishkah/office/requests/${r.id}`} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-semibold">{svc?.name}</span>
                      <span className="text-xs mk-muted shrink-0">{statusLabels[r.status]}</span>
                    </Link>
                  )
                })}
              </div>
            )}
            <Link href="/mishkah/office" className="mk-link text-xs mt-3 inline-flex items-center gap-1">
              مكتبي
              <ArrowLeft size={12} />
            </Link>
          </div>

          {/* الموظفون الجدد */}
          {newcomers.length > 0 && (
            <div className="mk-card p-4">
              <SectionHeader title="انضموا حديثًا" icon={<UserPlus size={16} style={{ color: 'var(--mk-gold)' }} />} />
              <div className="space-y-3">
                {newcomers.map((e) => (
                  <Link key={e.id} href={`/mishkah/directory/${e.id}`} className="flex items-center gap-2.5">
                    <Avatar person={e} size={34} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold truncate">{e.name}</span>
                      <span className="block text-xs mk-muted truncate">{e.title}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* منجزات الإدارات */}
          <div className="mk-card p-4">
            <SectionHeader title="منجزات الإدارات" icon={<Trophy size={16} style={{ color: 'var(--mk-gold)' }} />} />
            <div className="space-y-3">
              {units.slice(0, 3).map((u) => (
                <Link key={u.id} href={`/mishkah/units/${u.id}`} className="block">
                  <p className="text-sm font-semibold">{u.name}</p>
                  <p className="text-xs mk-muted mt-0.5">
                    {u.kpis?.[0] ? `${u.kpis[0].label}: ${u.kpis[0].value}` : u.about.slice(0, 60)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* أعضاء إدارتي */}
          {myUnit && (
            <div className="mk-card p-4">
              <SectionHeader title="زملاء إدارتي" />
              <AvatarStack people={employees.filter((e) => e.unitId === myUnit.id)} max={6} size={34} />
              <Link href={`/mishkah/units/${myUnit.id}`} className="mk-link text-xs mt-3 inline-block">
                صفحة {myUnit.name} ←
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function SummaryTile({ value, label, href }: { value: number; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl px-3 py-3 text-center transition"
      style={{ background: 'rgba(255,255,255,0.13)' }}
    >
      <span className="block text-2xl font-bold">{ar(value)}</span>
      <span className="block text-[0.7rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.82)' }}>
        {label}
      </span>
    </Link>
  )
}
