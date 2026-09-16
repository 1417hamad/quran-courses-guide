'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, MapPin, Video, CalendarPlus, Check, X, Paperclip, FileText } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Avatar, AvatarStack, Badge, EmptyState, InfoRow, SectionHeader } from '@/mishkah/ui'
import { ar, meetingKindLabels, meetingKindTones } from '@/mishkah/selectors'
import { formatDate, formatTime, weekdayOf } from '@/mishkah/data/dates'

export default function MeetingPage() {
  const params = useParams<{ id: string }>()
  const { meetings, employees, rsvp, toast } = useMishkah()
  const meeting = meetings.find((m) => m.id === params.id)

  if (!meeting) {
    return <EmptyState title="اللقاء غير موجود" action={<Link href="/mishkah/calendar" className="mk-link mt-2">العودة للتقويم</Link>} />
  }

  const organizer = employees.find((e) => e.id === meeting.organizerId)
  const invitees = employees.filter((e) => meeting.inviteeIds.includes(e.id))
  const past = meeting.date < new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/mishkah/calendar" className="mk-link text-sm inline-flex items-center gap-1">
        <ArrowRight size={14} />
        التقويم
      </Link>

      <article className="mk-card p-5">
        <Badge tone={meetingKindTones[meeting.kind]}>{meetingKindLabels[meeting.kind]}</Badge>
        <h1 className="text-lg font-bold mt-2.5 leading-8">{meeting.title}</h1>

        <div className="mt-4">
          <InfoRow label="التاريخ" value={`${weekdayOf(meeting.date)}، ${formatDate(meeting.date)}`} />
          <InfoRow label="الوقت" value={`${formatTime(meeting.start)} – ${formatTime(meeting.end)}`} />
          <InfoRow
            label="المكان"
            value={
              <span className="flex items-center gap-1.5">
                {meeting.onlineLink ? <Video size={13} /> : <MapPin size={13} />}
                {meeting.location}
              </span>
            }
          />
          {meeting.onlineLink && (
            <InfoRow
              label="رابط الاجتماع"
              value={
                <button type="button" className="mk-link" onClick={() => toast('هذه نسخة تجريبية — الرابط غير فعّال', 'info')}>
                  انضم عبر الرابط
                </button>
              }
            />
          )}
          <InfoRow label="المنظّم" value={organizer?.name ?? '—'} />
        </div>

        <p className="text-sm mk-muted leading-8 mt-4">{meeting.description}</p>

        {meeting.attachments.length > 0 && (
          <div className="mt-4">
            <SectionHeader title="المرفقات" />
            <ul className="space-y-2">
              {meeting.attachments.map((a) => (
                <li key={a.name} className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm" style={{ background: 'var(--mk-primary-tint)' }}>
                  <Paperclip size={14} style={{ color: 'var(--mk-primary)' }} />
                  <span className="flex-1 truncate font-semibold">{a.name}</span>
                  <span className="text-xs mk-muted">{a.size}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5">
          <SectionHeader title={`المدعوون (${ar(invitees.length)})`} />
          <AvatarStack people={invitees} max={8} size={32} />
          <div className="flex gap-4 text-xs mk-muted mt-3">
            <span>أكّد الحضور: {ar(meeting.attendance.yes)}</span>
            <span>اعتذر: {ar(meeting.attendance.no)}</span>
            <span>لم يردّ: {ar(meeting.attendance.pending)}</span>
          </div>
        </div>

        {!past && (
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t" style={{ borderColor: 'var(--mk-line)' }}>
            <button
              type="button"
              className={`mk-btn ${meeting.myRsvp === 'yes' ? 'mk-btn-primary' : 'mk-btn-soft'}`}
              onClick={() => rsvp(meeting.id, 'yes')}
            >
              <Check size={16} />
              تأكيد الحضور
            </button>
            <button
              type="button"
              className={`mk-btn ${meeting.myRsvp === 'no' ? 'mk-btn-danger' : 'mk-btn-ghost'}`}
              onClick={() => rsvp(meeting.id, 'no')}
            >
              <X size={16} />
              اعتذار
            </button>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={() => toast('أُضيف اللقاء إلى تقويمك', 'success')}>
              <CalendarPlus size={16} />
              إضافة إلى التقويم
            </button>
          </div>
        )}
      </article>

      {meeting.minutes && (
        <div className="mk-card p-5">
          <SectionHeader title="محضر اللقاء" icon={<FileText size={16} style={{ color: 'var(--mk-primary)' }} />} />
          <p className="text-sm mk-prewrap">{meeting.minutes}</p>
        </div>
      )}

      {past && !meeting.minutes && <p className="text-sm mk-muted text-center">انتهى هذا اللقاء ولم يُرفع محضره بعد.</p>}

      <div className="mk-card p-5">
        <SectionHeader title="قائمة الحضور" />
        <div className="space-y-2.5">
          {invitees.map((p) => (
            <Link key={p.id} href={`/mishkah/directory/${p.id}`} className="flex items-center gap-3">
              <Avatar person={p} size={32} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold truncate">{p.name}</span>
                <span className="block text-xs mk-muted truncate">{p.title}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
