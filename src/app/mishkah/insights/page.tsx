'use client'

import Link from 'next/link'
import { BarChart3, TriangleAlert, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { EmptyState, SectionHeader } from '@/mishkah/ui'
import { ar, statusLabels } from '@/mishkah/selectors'
import type { RequestStatus } from '@/mishkah/types'

/**
 * لوحة المؤشرات للإدارة العليا.
 * جميع الرسوم أحادية اللون (تدرّج واحد) لأن مهمتها مقارنة المقدار لا التمييز بين فئات،
 * ولون الحالة الحرجة محجوز للطلبات المتأخرة ويُرافقه دائمًا نص وأيقونة.
 */
export default function InsightsPage() {
  const { currentUser, requests, services, meetings, documents, units, employees, posts } = useMishkah()

  const allowed = currentUser.roles.some((r) => ['executive', 'sysadmin'].includes(r.role))
  if (!allowed) {
    return (
      <EmptyState
        title="لوحة المؤشرات متاحة للإدارة العليا"
        note="بدّل الدور إلى «الإدارة العليا» أو «مدير النظام» من قائمة الحساب لتجربتها."
        icon={<BarChart3 size={22} />}
        action={
          <Link href="/mishkah" className="mk-link mt-2">
            العودة للصفحة الرئيسة
          </Link>
        }
      />
    )
  }

  const submitted = requests.filter((r) => r.status !== 'draft')
  const completed = submitted.filter((r) => r.status === 'completed')
  const late = submitted.filter((r) => r.daysLeft < 0 && !['completed', 'rejected'].includes(r.status))
  const completionRate = submitted.length ? Math.round((completed.length / submitted.length) * 100) : 0
  const avgDays = submitted.length
    ? ar((submitted.reduce((sum, r) => sum + r.dueDays, 0) / submitted.length).toFixed(1)).replace('.', '٫')
    : '٠'

  const topServices = services
    .map((s) => ({ name: s.name, value: submitted.filter((r) => r.serviceId === s.id).length + Math.round(s.usageCount / 8) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const unitActivity = units
    .map((u) => {
      const memberIds = employees.filter((e) => e.unitId === u.id).map((e) => e.id)
      const unitPosts = posts.filter((p) => memberIds.includes(p.authorId)).length
      const comments = posts.reduce((n, p) => n + p.comments.filter((c) => memberIds.includes(c.authorId)).length, 0)
      const unitRequests = submitted.filter((r) => memberIds.includes(r.requesterId)).length
      return { name: u.name, value: unitPosts * 2 + comments + unitRequests }
    })
    .sort((a, b) => b.value - a.value)

  const ackDocs = documents.filter((d) => d.requiresAck)
  const ackTotal = ackDocs.reduce((n, d) => n + d.ackByIds.length, 0)
  const ackTarget = ackDocs.length * employees.length
  const ackRate = ackTarget ? Math.round((ackTotal / ackTarget) * 100) : 0

  const rsvpYes = meetings.reduce((n, m) => n + m.attendance.yes, 0)
  const rsvpAll = meetings.reduce((n, m) => n + m.attendance.yes + m.attendance.no + m.attendance.pending, 0)
  const rsvpRate = rsvpAll ? Math.round((rsvpYes / rsvpAll) * 100) : 0

  const satisfaction = 86
  const engagement = [
    { label: 'الأحد', value: 38 },
    { label: 'الاثنين', value: 52 },
    { label: 'الثلاثاء', value: 47 },
    { label: 'الأربعاء', value: 61 },
    { label: 'الخميس', value: 34 },
  ]

  const byStatus = (['submitted', 'review', 'approved', 'in_progress', 'completed', 'returned', 'rejected'] as RequestStatus[])
    .map((s) => ({ name: statusLabels[s], value: submitted.filter((r) => r.status === s).length }))
    .filter((x) => x.value > 0)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 size={20} style={{ color: 'var(--mk-primary)' }} />
          لوحة المؤشرات
        </h1>
        <p className="text-sm mk-muted mt-1">صورة مختصرة عن أداء الخدمات وتفاعل الموظفين مع المنصة.</p>
      </header>

      {/* المؤشرات الرئيسة */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatTile label="طلبات مقدّمة" value={ar(submitted.length)} hint="منذ بداية الفصل" />
        <StatTile label="نسبة الإنجاز" value={`${ar(completionRate)}٪`} hint={`${ar(completed.length)} طلبًا مكتملًا`} />
        <StatTile label="متوسط مدة الإنجاز" value={`${avgDays} يوم`} hint="أيام عمل" icon={<Clock size={14} />} />
        <StatTile
          label="طلبات متأخرة"
          value={ar(late.length)}
          hint="تجاوزت المدة المستهدفة"
          tone="var(--mk-danger)"
          icon={<TriangleAlert size={14} />}
        />
      </section>

      {/* أكثر الخدمات استخدامًا */}
      <section className="mk-card p-5">
        <SectionHeader title="أكثر الخدمات استخدامًا" />
        <BarList items={topServices} unit="طلبًا" />
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* الإدارات الأكثر تفاعلًا */}
        <section className="mk-card p-5">
          <SectionHeader title="الإدارات الأكثر تفاعلًا" />
          <BarList items={unitActivity} unit="نقطة تفاعل" />
        </section>

        {/* حالات الطلبات */}
        <section className="mk-card p-5">
          <SectionHeader title="توزيع الطلبات حسب الحالة" />
          <BarList items={byStatus} unit="طلبًا" />
        </section>
      </div>

      {/* المقاييس النسبية */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <Meter label="رضا الموظفين" value={satisfaction} note="من استطلاع الفصل الماضي" />
        <Meter label="تأكيد الحضور للقاءات" value={rsvpRate} note={`${ar(rsvpYes)} تأكيدًا من ${ar(rsvpAll)} دعوة`} />
        <Meter label="الاطلاع على القرارات" value={ackRate} note={`${ar(ackTotal)} تأكيد اطلاع`} />
        <Meter label="التفاعل مع المنصة" value={72} note="نسبة من دخل وتفاعل هذا الأسبوع" />
      </section>

      {/* معدل الدخول اليومي */}
      <section className="mk-card p-5">
        <SectionHeader title="معدل الدخول خلال أيام الأسبوع" />
        <ColumnChart items={engagement} />
        <p className="mk-hint mt-3">عدد الموظفين الذين دخلوا المنصة في كل يوم من أيام العمل.</p>
      </section>

      <section className="mk-card p-5">
        <SectionHeader title="ملخص سريع" icon={<CheckCircle2 size={16} style={{ color: 'var(--mk-success)' }} />} />
        <ul className="space-y-2 text-sm leading-7">
          <li>
            أُنجز <strong>{ar(completionRate)}٪</strong> من الطلبات المقدّمة، بمتوسط <strong>{avgDays}</strong> يوم عمل.
          </li>
          <li>
            {late.length > 0 ? (
              <>
                لدى المركز <strong style={{ color: 'var(--mk-danger)' }}>{ar(late.length)}</strong> طلبات تجاوزت مدتها المستهدفة وتحتاج متابعة.
              </>
            ) : (
              'لا توجد طلبات متأخرة حاليًا.'
            )}
          </li>
          <li>
            أعلى الإدارات تفاعلًا: <strong>{unitActivity[0]?.name}</strong>.
          </li>
        </ul>
        <Link href="/mishkah/office/inbox" className="mk-link text-sm mt-4 inline-flex items-center gap-1">
          متابعة الطلبات المتأخرة
          <ArrowRight size={13} />
        </Link>
      </section>
    </div>
  )
}

function StatTile({
  label,
  value,
  hint,
  tone = 'var(--mk-primary)',
  icon,
}: {
  label: string
  value: string
  hint: string
  tone?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="mk-card p-4">
      <p className="text-xs mk-muted flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-3xl font-bold mt-1.5" style={{ color: tone }}>
        {value}
      </p>
      <p className="text-xs mk-muted mt-1">{hint}</p>
    </div>
  )
}

/** أعمدة أفقية بتدرّج لون واحد — الأغمق يعني الأكبر */
function BarList({ items, unit }: { items: { name: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => {
        const pct = Math.round((it.value / max) * 100)
        const shade = 0.35 + 0.65 * (it.value / max)
        return (
          <div key={it.name} title={`${it.name}: ${it.value} ${unit}`}>
            <div className="flex items-center justify-between gap-3 text-sm mb-1">
              <span className="font-semibold truncate">{it.name}</span>
              <span className="text-xs mk-muted shrink-0">{ar(it.value)}</span>
            </div>
            <div style={{ height: 10, background: 'var(--mk-primary-tint)', borderRadius: 4 }}>
              <div
                style={{
                  width: `${Math.max(3, pct)}%`,
                  height: '100%',
                  background: `color-mix(in srgb, var(--mk-primary) ${Math.round(shade * 100)}%, #EAF1EF)`,
                  borderStartEndRadius: 4,
                  borderEndEndRadius: 4,
                  transition: 'width 0.4s ease',
                }}
                aria-hidden
              />
            </div>
            <span className="sr-only">{`${it.name}: ${it.value} ${unit}`}</span>
            {i === items.length - 1 && <span className="sr-only">نهاية القائمة</span>}
          </div>
        )
      })}
    </div>
  )
}

/** مقياس نسبة واحدة مقابل سقف ١٠٠٪ */
function Meter({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="mk-card p-4" title={`${label}: ${value}٪`}>
      <p className="text-xs mk-muted">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: 'var(--mk-primary)' }}>
        {ar(value)}٪
      </p>
      <div className="mt-2.5" style={{ height: 8, background: 'var(--mk-primary-tint)', borderRadius: 4 }}>
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            background: 'var(--mk-primary)',
            borderStartEndRadius: 4,
            borderEndEndRadius: 4,
            transition: 'width 0.4s ease',
          }}
          aria-hidden
        />
      </div>
      <p className="text-xs mk-muted mt-2">{note}</p>
    </div>
  )
}

/** أعمدة رأسية ليوم واحد لكل عمود */
function ColumnChart({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="flex items-end gap-2.5" style={{ height: 150 }}>
      {items.map((it) => (
        <div key={it.label} className="flex-1 flex flex-col items-center gap-1.5" title={`${it.label}: ${it.value}`}>
          <span className="text-xs font-bold" style={{ color: 'var(--mk-primary)' }}>
            {ar(it.value)}
          </span>
          <div
            style={{
              width: '100%',
              height: `${(it.value / max) * 100}%`,
              background: `color-mix(in srgb, var(--mk-primary) ${Math.round((0.4 + 0.6 * (it.value / max)) * 100)}%, #EAF1EF)`,
              borderStartStartRadius: 4,
              borderStartEndRadius: 4,
              transition: 'height 0.4s ease',
            }}
            aria-hidden
          />
          <span className="text-xs mk-muted">{it.label}</span>
        </div>
      ))}
    </div>
  )
}
