'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, Building2, FileText, CalendarClock, Users, LayoutGrid, BarChart3, Paperclip } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { PostCard } from '@/mishkah/components/PostCard'
import { Avatar, Badge, Dot, EmptyState, Tabs } from '@/mishkah/ui'
import { ar, hasRole, teamKindLabels, categoryLabels } from '@/mishkah/selectors'
import { formatDate, formatTime, weekdayOf } from '@/mishkah/data/dates'
import { docTypeLabels } from '@/mishkah/data'

type Tab = 'overview' | 'news' | 'meetings' | 'files' | 'services' | 'teams'

export default function UnitPage() {
  const params = useParams<{ id: string }>()
  const { units, employees, posts, meetings, documents, services, teams, currentUser } = useMishkah()
  const [tab, setTab] = useState<Tab>('overview')

  const unit = units.find((u) => u.id === params.id)
  if (!unit) {
    return <EmptyState title="الإدارة غير موجودة" action={<Link href="/mishkah/units" className="mk-link mt-2">العودة للإدارات</Link>} />
  }

  const manager = employees.find((e) => e.id === unit.managerId)
  const members = employees.filter((e) => e.unitId === unit.id)
  const unitPosts = posts.filter((p) => p.audience.kind === 'unit' && p.audience.ref === unit.id)
  const unitMeetings = meetings.filter((m) => m.unitId === unit.id)
  const unitDocs = documents.filter((d) => d.ownerUnitId === unit.id)
  const unitServices = services.filter((s) => s.ownerUnitId === unit.id)
  const unitTeams = teams.filter((t) => t.unitId === unit.id)
  const canSeeKpis = hasRole(currentUser, 'unit_manager', unit.id) || hasRole(currentUser, 'executive') || hasRole(currentUser, 'sysadmin')

  return (
    <div className="space-y-5">
      <Link href="/mishkah/units" className="mk-link text-sm inline-flex items-center gap-1">
        <ArrowRight size={14} />
        الإدارات والفرق
      </Link>

      <header className="mk-card p-5">
        <div className="flex items-start gap-3.5">
          <span className="mk-avatar" style={{ width: 48, height: 48, background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}>
            <Building2 size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold">{unit.name}</h1>
            <p className="text-sm mk-muted mt-1.5 leading-8">{unit.about}</p>
          </div>
        </div>

        {manager && (
          <Link href={`/mishkah/directory/${manager.id}`} className="flex items-center gap-3 mt-4 rounded-2xl p-3" style={{ background: 'var(--mk-primary-tint)' }}>
            <Avatar person={manager} size={40} />
            <span className="min-w-0">
              <span className="block text-xs mk-muted">مدير الإدارة</span>
              <span className="block text-sm font-bold truncate">{manager.name}</span>
            </span>
          </Link>
        )}

        {unit.tracks && (
          <div className="mt-4">
            <p className="text-xs font-bold mb-2">المسارات</p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {unit.tracks.map((t) => (
                <div key={t.id} className="mk-card p-3">
                  <p className="text-sm font-bold">{t.name}</p>
                  {t.note && <p className="text-xs mk-muted mt-1">{t.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {canSeeKpis && unit.kpis && (
          <div className="mt-4">
            <p className="text-xs font-bold mb-2 flex items-center gap-1.5">
              <BarChart3 size={13} style={{ color: 'var(--mk-gold)' }} />
              مؤشرات مختصرة (تظهر بحسب الصلاحية)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {unit.kpis.map((k) => (
                <div key={k.label} className="rounded-2xl p-3 text-center" style={{ background: 'var(--mk-gold-soft)' }}>
                  <p className="text-lg font-bold" style={{ color: 'var(--mk-warning)' }}>
                    {k.value}
                  </p>
                  <p className="text-xs mk-muted">{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: 'overview', label: 'الأعضاء', count: members.length },
          { id: 'news', label: 'الأخبار', count: unitPosts.length },
          { id: 'meetings', label: 'اللقاءات', count: unitMeetings.length },
          { id: 'files', label: 'الملفات والقرارات', count: unitDocs.length },
          { id: 'services', label: 'الخدمات', count: unitServices.length },
          { id: 'teams', label: 'الفرق واللجان', count: unitTeams.length },
        ]}
      />

      {tab === 'overview' && (
        <div className="grid sm:grid-cols-2 gap-3">
          {members.map((m) => (
            <Link key={m.id} href={`/mishkah/directory/${m.id}`} className="mk-card mk-card-hover p-3.5 flex items-center gap-3">
              <Avatar person={m} size={42} />
              <span className="min-w-0">
                <span className="block text-sm font-bold truncate">{m.name}</span>
                <span className="block text-xs mk-muted truncate">{m.title}</span>
              </span>
              {m.id === unit.managerId && <Badge tone="var(--mk-primary)">المدير</Badge>}
            </Link>
          ))}
        </div>
      )}

      {tab === 'news' && (
        <div className="space-y-4">
          {unitPosts.length === 0 ? <EmptyState title="لا توجد أخبار لهذه الإدارة بعد" /> : unitPosts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {tab === 'meetings' && (
        <div className="space-y-2.5">
          {unitMeetings.length === 0 ? (
            <EmptyState title="لا توجد لقاءات مجدولة" icon={<CalendarClock size={22} />} />
          ) : (
            unitMeetings.map((m) => (
              <Link key={m.id} href={`/mishkah/calendar/${m.id}`} className="mk-card mk-card-hover p-4 flex items-center gap-3">
                <span className="rounded-xl px-2.5 py-2 text-center shrink-0" style={{ background: 'var(--mk-primary-tint)', color: 'var(--mk-primary)' }}>
                  <span className="block text-xs font-bold">{weekdayOf(m.date)}</span>
                  <span className="block text-xs">{formatTime(m.start)}</span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{m.title}</span>
                  <span className="block text-xs mk-muted">{formatDate(m.date)} <Dot /> {m.location}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'files' && (
        <div className="space-y-2.5">
          {unitDocs.length === 0 ? (
            <EmptyState title="لا توجد ملفات لهذه الإدارة" icon={<FileText size={22} />} />
          ) : (
            unitDocs.map((d) => (
              <Link key={d.id} href={`/mishkah/knowledge/${d.id}`} className="mk-card mk-card-hover p-4 flex items-center gap-3">
                <Paperclip size={16} style={{ color: 'var(--mk-primary)' }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold mk-clamp-2">{d.title}</span>
                  <span className="block text-xs mk-muted mt-0.5">
                    {docTypeLabels[d.type]} <Dot /> إصدار {ar(d.version)} <Dot /> {formatDate(d.issuedAt)}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'services' && (
        <div className="grid sm:grid-cols-2 gap-3">
          {unitServices.length === 0 ? (
            <EmptyState title="لا توجد خدمات تابعة لهذه الإدارة" icon={<LayoutGrid size={22} />} />
          ) : (
            unitServices.map((s) => (
              <Link key={s.id} href={`/mishkah/services/${s.id}`} className="mk-card mk-card-hover p-4">
                <p className="font-bold text-sm">{s.name}</p>
                <p className="text-xs mk-muted mt-1">{categoryLabels[s.category]} <Dot /> {ar(s.slaDays)} أيام عمل</p>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'teams' && (
        <div className="grid sm:grid-cols-2 gap-3">
          {unitTeams.length === 0 ? (
            <EmptyState title="لا توجد فرق تابعة" icon={<Users size={22} />} />
          ) : (
            unitTeams.map((t) => (
              <Link key={t.id} href={`/mishkah/teams/${t.id}`} className="mk-card mk-card-hover p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm">{t.name}</p>
                  <Badge tone={t.status === 'active' ? 'var(--mk-success)' : 'var(--mk-muted)'}>
                    {t.status === 'active' ? 'نشط' : 'مؤرشف'}
                  </Badge>
                </div>
                <p className="text-xs mk-muted mt-1">{teamKindLabels[t.kind]} <Dot /> {ar(t.memberIds.length)} أعضاء</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
