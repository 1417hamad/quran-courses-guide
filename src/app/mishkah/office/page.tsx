'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutGrid,
  LayoutList,
  Table,
  Inbox,
  CalendarDays,
  FileEdit,
  ExternalLink,
  Users,
  Bell,
  MapPin,
  Video,
} from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { RequestList, type ViewMode } from '@/mishkah/components/RequestViews'
import { Avatar, Badge, Dot, EmptyState, SectionHeader, Tabs } from '@/mishkah/ui'
import { ar, canApprove, roleNames } from '@/mishkah/selectors'
import { platformLinks } from '@/mishkah/data'
import { formatDate, formatTime, isThisWeek, isToday, weekdayOf } from '@/mishkah/data/dates'

type Tab = 'requests' | 'actions' | 'calendar' | 'drafts' | 'groups'

export default function OfficePage() {
  const { currentUser, requests, meetings, units, teams, notifications } = useMishkah()
  const [tab, setTab] = useState<Tab>('requests')
  const [mode, setMode] = useState<ViewMode>('cards')

  const mine = requests.filter((r) => r.requesterId === currentUser.id && r.status !== 'draft')
  const drafts = requests.filter((r) => r.requesterId === currentUser.id && r.status === 'draft')
  const actions = requests.filter(
    (r) =>
      (r.currentOwnerId === currentUser.id && ['submitted', 'review', 'approved'].includes(r.status)) ||
      (r.requesterId === currentUser.id && r.status === 'returned'),
  )
  const myMeetings = meetings.filter((m) => m.inviteeIds.includes(currentUser.id))
  const upcoming = myMeetings.filter((m) => isThisWeek(m.date))
  const myUnit = units.find((u) => u.id === currentUser.unitId)
  const myTeams = teams.filter((t) => currentUser.teamIds.includes(t.id))
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-5">
      <header className="mk-card p-5">
        <div className="flex items-center gap-3.5">
          <Avatar person={currentUser} size={54} />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">مكتبي</h1>
            <p className="text-sm mk-muted truncate">
              {currentUser.name} <Dot /> {myUnit?.name}
            </p>
          </div>
          <Link href="/mishkah/office/profile" className="mk-btn mk-btn-ghost mk-btn-sm">
            ملفي
          </Link>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {roleNames(currentUser).map((r) => (
            <Badge key={r} tone="var(--mk-primary)">
              {r}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <Stat label="طلباتي" value={mine.length} href="#" />
          <Stat label="بانتظار إجراءك" value={actions.length} href="/mishkah/office/inbox" />
          <Stat label="إشعارات غير مقروءة" value={unread} href="/mishkah/notifications" />
        </div>
      </header>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: 'requests', label: 'طلباتي', count: mine.length },
          { id: 'actions', label: 'مطلوب مني', count: actions.length },
          { id: 'calendar', label: 'تقويمي', count: upcoming.length },
          { id: 'drafts', label: 'المسودات', count: drafts.length },
          { id: 'groups', label: 'إدارتي وفرقي' },
        ]}
      />

      {tab === 'requests' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm mk-muted">{ar(mine.length)} طلبات</p>
            <div className="flex gap-1">
              {(
                [
                  { id: 'cards', icon: LayoutGrid, label: 'بطاقات' },
                  { id: 'list', icon: LayoutList, label: 'قائمة' },
                  { id: 'table', icon: Table, label: 'جدول' },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`mk-chip ${mode === v.id ? 'mk-chip-active' : ''}`}
                  onClick={() => setMode(v.id)}
                  aria-label={v.label}
                >
                  <v.icon size={14} />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
          {mine.length === 0 ? (
            <EmptyState
              title="لم تقدّم أي طلب بعد"
              note="ابدأ من دليل الخدمات واختر الخدمة المناسبة."
              action={
                <Link href="/mishkah/services" className="mk-btn mk-btn-primary mk-btn-sm mt-3">
                  تصفح الخدمات
                </Link>
              }
            />
          ) : (
            <RequestList requests={mine} mode={mode} />
          )}
        </section>
      )}

      {tab === 'actions' && (
        <section className="space-y-3">
          {canApprove(currentUser) && (
            <Link href="/mishkah/office/inbox" className="mk-card mk-card-hover p-4 flex items-center gap-3">
              <span className="mk-avatar" style={{ width: 40, height: 40, background: 'var(--mk-gold-soft)', color: 'var(--mk-warning)' }}>
                <Inbox size={19} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold">صندوق الإجراءات</span>
                <span className="block text-xs mk-muted">اعتماد الطلبات وتحديث حالاتها</span>
              </span>
              <ExternalLink size={15} className="mk-muted" />
            </Link>
          )}
          {actions.length === 0 ? (
            <EmptyState title="لا توجد إجراءات مطلوبة منك" note="كل شيء على ما يرام." icon={<Inbox size={22} />} />
          ) : (
            <RequestList requests={actions} mode="cards" />
          )}
        </section>
      )}

      {tab === 'calendar' && (
        <section className="space-y-3">
          <SectionHeader
            title="لقاءاتي هذا الأسبوع"
            icon={<CalendarDays size={16} style={{ color: 'var(--mk-primary)' }} />}
            action={
              <Link href="/mishkah/calendar" className="mk-link text-xs">
                التقويم الكامل ←
              </Link>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState title="لا توجد لقاءات هذا الأسبوع" icon={<CalendarDays size={22} />} />
          ) : (
            <div className="space-y-2.5">
              {upcoming.map((m) => (
                <Link key={m.id} href={`/mishkah/calendar/${m.id}`} className="mk-card mk-card-hover p-4 flex items-start gap-3">
                  <span
                    className="rounded-xl px-2.5 py-2 text-center shrink-0"
                    style={{ background: 'var(--mk-primary-tint)', color: 'var(--mk-primary)' }}
                  >
                    <span className="block text-xs font-bold">{isToday(m.date) ? 'اليوم' : weekdayOf(m.date)}</span>
                    <span className="block text-xs mt-0.5">{formatTime(m.start)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-sm leading-6">{m.title}</span>
                    <span className="block text-xs mk-muted mt-1 flex items-center gap-1">
                      {m.onlineLink ? <Video size={12} /> : <MapPin size={12} />}
                      {m.location}
                    </span>
                  </span>
                  {m.myRsvp !== 'none' && (
                    <Badge tone={m.myRsvp === 'yes' ? 'var(--mk-success)' : 'var(--mk-muted)'}>
                      {m.myRsvp === 'yes' ? 'سأحضر' : 'اعتذرت'}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'drafts' && (
        <section>
          {drafts.length === 0 ? (
            <EmptyState title="لا توجد مسودات محفوظة" icon={<FileEdit size={22} />} />
          ) : (
            <RequestList requests={drafts} mode="cards" />
          )}
        </section>
      )}

      {tab === 'groups' && (
        <section className="space-y-4">
          {myUnit && (
            <div>
              <SectionHeader title="إدارتي" icon={<Users size={16} style={{ color: 'var(--mk-primary)' }} />} />
              <Link href={`/mishkah/units/${myUnit.id}`} className="mk-card mk-card-hover p-4 block">
                <p className="font-bold">{myUnit.name}</p>
                <p className="text-sm mk-muted mt-1 leading-7 mk-clamp-2">{myUnit.about}</p>
              </Link>
            </div>
          )}

          <div>
            <SectionHeader title="فرقي ولجاني" />
            {myTeams.length === 0 ? (
              <p className="text-sm mk-muted">لست عضوًا في أي فريق حاليًا.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {myTeams.map((t) => (
                  <Link key={t.id} href={`/mishkah/teams/${t.id}`} className="mk-card mk-card-hover p-4">
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs mk-muted mt-1">
                      {ar(t.memberIds.length)} أعضاء <Dot /> منذ {formatDate(t.startDate)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionHeader title="المنصات التي أستخدمها" icon={<ExternalLink size={16} />} />
            <div className="grid sm:grid-cols-2 gap-2.5">
              {platformLinks.map((l) => (
                <a key={l.id} href={l.href} className="mk-card mk-card-hover p-3.5 flex items-center gap-3">
                  <span className="mk-dot" style={{ background: l.tone, width: 10, height: 10 }} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold truncate">{l.label}</span>
                    <span className="block text-xs mk-muted truncate">{l.description}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="إشعاراتي" icon={<Bell size={16} />} />
            <Link href="/mishkah/notifications" className="mk-link text-sm">
              فتح مركز الإشعارات ({ar(unread)} غير مقروء) ←
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-2xl px-3 py-3 text-center" style={{ background: 'var(--mk-primary-tint)' }}>
      <span className="block text-xl font-bold" style={{ color: 'var(--mk-primary)' }}>
        {ar(value)}
      </span>
      <span className="block text-[0.7rem] mk-muted mt-0.5">{label}</span>
    </Link>
  )
}
