'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, CalendarClock, Link2, Paperclip, Crown } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { PostCard } from '@/mishkah/components/PostCard'
import { Avatar, Badge, EmptyState, InfoRow, SectionHeader } from '@/mishkah/ui'
import { ar, teamKindLabels } from '@/mishkah/selectors'
import { formatDate, formatTime, weekdayOf } from '@/mishkah/data/dates'

export default function TeamPage() {
  const params = useParams<{ id: string }>()
  const { teams, employees, posts, meetings, units } = useMishkah()
  const team = teams.find((t) => t.id === params.id)

  if (!team) {
    return <EmptyState title="الفريق غير موجود" action={<Link href="/mishkah/units" className="mk-link mt-2">العودة</Link>} />
  }

  const lead = employees.find((e) => e.id === team.leadId)
  const members = employees.filter((e) => team.memberIds.includes(e.id))
  const teamPosts = posts.filter((p) => p.audience.kind === 'team' && p.audience.ref === team.id)
  const teamMeetings = meetings.filter((m) => m.teamId === team.id)
  const unit = units.find((u) => u.id === team.unitId)

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/mishkah/units" className="mk-link text-sm inline-flex items-center gap-1">
        <ArrowRight size={14} />
        الإدارات والفرق
      </Link>

      <header className="mk-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold">{team.name}</h1>
            <p className="text-xs mk-muted mt-1">
              {teamKindLabels[team.kind]}
              {unit ? `، تابع لـ${unit.name}` : ''}
            </p>
          </div>
          <Badge tone={team.status === 'active' ? 'var(--mk-success)' : 'var(--mk-muted)'}>
            {team.status === 'active' ? 'نشط' : 'مؤرشف'}
          </Badge>
        </div>

        <p className="text-sm mk-muted mt-3 leading-8">{team.about}</p>

        <div className="mt-4">
          <InfoRow label="تاريخ البداية" value={formatDate(team.startDate)} />
          <InfoRow label="تاريخ النهاية" value={team.endDate ? formatDate(team.endDate) : 'مفتوح'} />
          <InfoRow label="عدد الأعضاء" value={`${ar(members.length)} أعضاء`} />
        </div>
      </header>

      <section>
        <SectionHeader title="الأعضاء" />
        <div className="grid sm:grid-cols-2 gap-3">
          {members.map((m) => (
            <Link key={m.id} href={`/mishkah/directory/${m.id}`} className="mk-card mk-card-hover p-3.5 flex items-center gap-3">
              <Avatar person={m} size={40} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold truncate">{m.name}</span>
                <span className="block text-xs mk-muted truncate">{m.title}</span>
              </span>
              {m.id === team.leadId && (
                <span className="mk-badge" style={{ background: 'var(--mk-gold-soft)', color: 'var(--mk-warning)' }}>
                  <Crown size={11} />
                  القائد
                </span>
              )}
            </Link>
          ))}
        </div>
        {lead && <p className="mk-hint mt-2">يقود الفريق: {lead.name}</p>}
      </section>

      <section>
        <SectionHeader title="اللقاءات" icon={<CalendarClock size={16} style={{ color: 'var(--mk-primary)' }} />} />
        {teamMeetings.length === 0 ? (
          <p className="text-sm mk-muted">لا توجد لقاءات مجدولة لهذا الفريق.</p>
        ) : (
          <div className="space-y-2.5">
            {teamMeetings.map((m) => (
              <Link key={m.id} href={`/mishkah/calendar/${m.id}`} className="mk-card mk-card-hover p-3.5 flex items-center gap-3">
                <span className="rounded-xl px-2.5 py-1.5 text-center shrink-0" style={{ background: 'var(--mk-primary-tint)', color: 'var(--mk-primary)' }}>
                  <span className="block text-xs font-bold">{weekdayOf(m.date)}</span>
                  <span className="block text-[0.7rem]">{formatTime(m.start)}</span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold truncate">{m.title}</span>
                  <span className="block text-xs mk-muted">{formatDate(m.date)}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="المنشورات والإعلانات" />
        {teamPosts.length === 0 ? (
          <p className="text-sm mk-muted">لا توجد منشورات في مساحة الفريق.</p>
        ) : (
          <div className="space-y-4">
            {teamPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="الملفات والروابط" icon={<Link2 size={16} />} />
        <div className="space-y-2">
          {(team.links ?? []).map((l) => (
            <a key={l.label} href={l.href} className="mk-card mk-card-hover p-3.5 flex items-center gap-2.5">
              <Link2 size={15} style={{ color: 'var(--mk-primary)' }} />
              <span className="text-sm font-semibold">{l.label}</span>
            </a>
          ))}
          {teamPosts
            .filter((p) => p.attachment)
            .map((p) => (
              <div key={p.id} className="mk-card p-3.5 flex items-center gap-2.5">
                <Paperclip size={15} style={{ color: 'var(--mk-primary)' }} />
                <span className="text-sm font-semibold flex-1 truncate">{p.attachment?.name}</span>
                <span className="text-xs mk-muted">{p.attachment?.size}</span>
              </div>
            ))}
          {(team.links ?? []).length === 0 && teamPosts.filter((p) => p.attachment).length === 0 && (
            <p className="text-sm mk-muted">لا توجد ملفات أو روابط بعد.</p>
          )}
        </div>
      </section>
    </div>
  )
}
