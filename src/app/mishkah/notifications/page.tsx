'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCheck,
  Bell,
  FileText,
  AtSign,
  CalendarClock,
  Inbox,
  Megaphone,
  PartyPopper,
  CircleAlert,
} from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Badge, EmptyState, Tabs } from '@/mishkah/ui'
import { ar } from '@/mishkah/selectors'
import { relativeTime } from '@/mishkah/data/dates'
import type { NotificationKind } from '@/mishkah/types'

const kindMeta: Record<NotificationKind, { label: string; icon: React.ElementType; tone: string }> = {
  action: { label: 'إجراء مطلوب', icon: CircleAlert, tone: 'var(--mk-danger)' },
  decision: { label: 'قرار جديد', icon: FileText, tone: 'var(--mk-primary)' },
  mention: { label: 'تعليق أو إشارة', icon: AtSign, tone: 'var(--mk-info)' },
  meeting: { label: 'موعد أو لقاء', icon: CalendarClock, tone: 'var(--mk-gold)' },
  request: { label: 'تحديث على طلب', icon: Inbox, tone: 'var(--mk-info)' },
  announcement: { label: 'إعلان', icon: Megaphone, tone: 'var(--mk-primary)' },
  celebration: { label: 'تهنئة أو مناسبة', icon: PartyPopper, tone: '#C05E4C' },
}

type Tab = 'all' | 'unread' | NotificationKind

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useMishkah()
  const [tab, setTab] = useState<Tab>('all')

  const unread = notifications.filter((n) => !n.read)
  const list = notifications.filter((n) => (tab === 'all' ? true : tab === 'unread' ? !n.read : n.kind === tab))

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">الإشعارات</h1>
          <p className="text-sm mk-muted mt-1">
            {unread.length > 0 ? `لديك ${ar(unread.length)} إشعارات غير مقروءة` : 'لا توجد إشعارات غير مقروءة'}
          </p>
        </div>
        {unread.length > 0 && (
          <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={markAllNotificationsRead}>
            <CheckCheck size={15} />
            تعليم الكل كمقروء
          </button>
        )}
      </header>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'الكل', count: notifications.length },
          { id: 'unread', label: 'غير المقروءة', count: unread.length },
          { id: 'action', label: 'إجراء مطلوب' },
          { id: 'decision', label: 'قرارات' },
          { id: 'meeting', label: 'مواعيد' },
          { id: 'request', label: 'طلبات' },
          { id: 'mention', label: 'إشارات' },
          { id: 'announcement', label: 'إعلانات' },
          { id: 'celebration', label: 'مناسبات' },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState title="لا توجد إشعارات في هذا التصنيف" icon={<Bell size={22} />} />
      ) : (
        <div className="space-y-2.5">
          {list.map((n) => {
            const meta = kindMeta[n.kind]
            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => markNotificationRead(n.id)}
                className="mk-card mk-card-hover p-4 flex items-start gap-3"
                style={!n.read ? { borderColor: `color-mix(in srgb, ${meta.tone} 35%, var(--mk-line))` } : undefined}
              >
                <span
                  className="mk-avatar shrink-0"
                  style={{ width: 38, height: 38, background: `color-mix(in srgb, ${meta.tone} 12%, #fff)`, color: meta.tone }}
                >
                  <meta.icon size={18} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {n.importance === 'high' && <Badge tone="var(--mk-danger)">مهم</Badge>}
                    {!n.read && <span className="mk-dot" style={{ background: meta.tone }} />}
                  </span>
                  <span className="block text-sm font-bold leading-6">{n.title}</span>
                  <span className="block text-sm mk-muted leading-7 mt-0.5">{n.body}</span>
                  <span className="block text-xs mk-muted mt-1.5">{relativeTime(n.at)}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
