'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Inbox, AlertTriangle, RotateCcw, PlayCircle, CheckCheck } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { RequestCard } from '@/mishkah/components/RequestViews'
import { EmptyState, Tabs } from '@/mishkah/ui'
import { ar, canApprove } from '@/mishkah/selectors'

type Box = 'approve' | 'execute' | 'late' | 'returned'

export default function InboxPage() {
  const { currentUser, requests } = useMishkah()
  const [box, setBox] = useState<Box>('approve')

  const mineToHandle = requests.filter((r) => r.currentOwnerId === currentUser.id)
  const toApprove = mineToHandle.filter((r) => ['submitted', 'review'].includes(r.status))
  const toExecute = mineToHandle.filter((r) => ['approved', 'in_progress'].includes(r.status))
  const late = mineToHandle.filter((r) => r.daysLeft < 0 && !['completed', 'rejected'].includes(r.status))
  const returned = requests.filter((r) => r.status === 'returned' && (r.requesterId === currentUser.id || r.timeline.some((t) => t.actorId === currentUser.id)))

  const boxes: Record<Box, typeof requests> = {
    approve: toApprove,
    execute: toExecute,
    late,
    returned,
  }

  if (!canApprove(currentUser)) {
    return (
      <div className="space-y-4">
        <Link href="/mishkah/office" className="mk-link text-sm inline-flex items-center gap-1">
          <ArrowRight size={14} />
          مكتبي
        </Link>
        <EmptyState
          title="صندوق الإجراءات غير متاح لدورك الحالي"
          note="يظهر هذا الصندوق لمديري الإدارات ومسؤولي الخدمات. يمكنك تجربته بتبديل الدور من قائمة الحساب."
          icon={<Inbox size={22} />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/mishkah/office" className="mk-link text-sm inline-flex items-center gap-1">
          <ArrowRight size={14} />
          مكتبي
        </Link>
        <h1 className="text-xl font-bold mt-2">صندوق الإجراءات</h1>
        <p className="text-sm mk-muted mt-1">الطلبات التي تنتظر قرارك أو تنفيذك، مرتّبة بحسب أولويتها.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Kpi label="تنتظر اعتمادك" value={toApprove.length} icon={<CheckCheck size={16} />} tone="var(--mk-info)" />
        <Kpi label="تنتظر التنفيذ" value={toExecute.length} icon={<PlayCircle size={16} />} tone="var(--mk-primary)" />
        <Kpi label="متأخرة" value={late.length} icon={<AlertTriangle size={16} />} tone="var(--mk-danger)" />
        <Kpi label="معادة للاستكمال" value={returned.length} icon={<RotateCcw size={16} />} tone="var(--mk-warning)" />
      </div>

      <Tabs<Box>
        value={box}
        onChange={setBox}
        items={[
          { id: 'approve', label: 'تنتظر الاعتماد', count: toApprove.length },
          { id: 'execute', label: 'تنتظر التنفيذ', count: toExecute.length },
          { id: 'late', label: 'متأخرة', count: late.length },
          { id: 'returned', label: 'معادة للاستكمال', count: returned.length },
        ]}
      />

      {boxes[box].length === 0 ? (
        <EmptyState title="لا توجد طلبات في هذا الصندوق" note="كل الطلبات في هذا التصنيف منجزة." icon={<Inbox size={22} />} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {boxes[box].map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return (
    <div className="mk-card p-3.5">
      <span className="mk-avatar mb-2" style={{ width: 34, height: 34, background: `color-mix(in srgb, ${tone} 12%, #fff)`, color: tone }}>
        {icon}
      </span>
      <p className="text-xl font-bold" style={{ color: tone }}>
        {ar(value)}
      </p>
      <p className="text-xs mk-muted">{label}</p>
    </div>
  )
}
