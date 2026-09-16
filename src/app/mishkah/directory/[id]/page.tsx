'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowRight, Mail, Phone, Hash, Clock, Building2, MessageCircle } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Avatar, Badge, EmptyState, InfoRow, SectionHeader } from '@/mishkah/ui'
import { ar, roleNames } from '@/mishkah/selectors'
import { formatDate } from '@/mishkah/data/dates'

export default function PersonPage() {
  const params = useParams<{ id: string }>()
  const { employees, units, teams, services, toast } = useMishkah()
  const person = employees.find((e) => e.id === params.id)

  if (!person) {
    return <EmptyState title="الموظف غير موجود" action={<Link href="/mishkah/directory" className="mk-link mt-2">العودة للدليل</Link>} />
  }

  const unit = units.find((u) => u.id === person.unitId)
  const myTeams = teams.filter((t) => person.teamIds.includes(t.id))
  const ownedServices = services.filter((s) => s.ownerId === person.id)

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/mishkah/directory" className="mk-link text-sm inline-flex items-center gap-1">
        <ArrowRight size={14} />
        دليل الموظفين
      </Link>

      <header className="mk-card p-5">
        <div className="flex items-center gap-4">
          <Avatar person={person} size={68} />
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">{person.name}</h1>
            <p className="text-sm mk-muted">{person.title}</p>
            {unit && (
              <Link href={`/mishkah/units/${unit.id}`} className="text-xs mk-link mt-0.5 flex items-center gap-1">
                <Building2 size={12} />
                {unit.name}
              </Link>
            )}
          </div>
        </div>

        <p className="text-sm mk-muted leading-8 mt-4">{person.bio}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {roleNames(person).map((r) => (
            <Badge key={r} tone="var(--mk-primary)">
              {r}
            </Badge>
          ))}
        </div>

        <button type="button" className="mk-btn mk-btn-soft mt-4" onClick={() => toast('هذه نسخة تجريبية — المراسلة غير مفعّلة', 'info')}>
          <MessageCircle size={16} />
          مراسلة
        </button>
      </header>

      <div className="mk-card p-5">
        <SectionHeader title="مجال العمل" />
        <div className="flex flex-wrap gap-1.5">
          {person.expertise.map((x) => (
            <Badge key={x} tone="var(--mk-gold-deep)">
              {x}
            </Badge>
          ))}
        </div>
        {ownedServices.length > 0 && (
          <p className="mk-hint mt-3">
            يمكن الرجوع إليه في: {ownedServices.map((s) => s.name).join('، ')}
          </p>
        )}
      </div>

      <div className="mk-card p-5">
        <SectionHeader title="التواصل وأوقات العمل" />
        <InfoRow label="البريد" value={<span className="flex items-center gap-1.5"><Mail size={13} />{person.email}</span>} />
        <InfoRow label="الجوال" value={<span className="flex items-center gap-1.5"><Phone size={13} />{person.phone}</span>} />
        {person.extension && <InfoRow label="التحويلة" value={<span className="flex items-center gap-1.5"><Hash size={13} />{ar(person.extension)}</span>} />}
        <InfoRow label="أيام العمل" value={<span className="flex items-center gap-1.5"><Clock size={13} />{person.workDays.join('، ')}</span>} />
        <InfoRow label="أوقات العمل" value={person.workHours} />
        <InfoRow label="تاريخ الانضمام" value={formatDate(person.joinedAt)} />
      </div>

      {myTeams.length > 0 && (
        <div className="mk-card p-5">
          <SectionHeader title="الفرق واللجان" />
          <div className="space-y-2">
            {myTeams.map((t) => (
              <Link key={t.id} href={`/mishkah/teams/${t.id}`} className="mk-side-link">
                {t.name}
                {t.leadId === person.id && <Badge tone="var(--mk-gold-deep)">القائد</Badge>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
