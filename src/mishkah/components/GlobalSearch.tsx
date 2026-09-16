'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, FileText, Users, LayoutGrid, Calendar, Building2 } from 'lucide-react'
import { useMishkah } from '../store'
import { Modal, Avatar, Dot } from '../ui'
import { categoryLabels } from '../selectors'
import { docTypeLabels } from '../data'
import { formatDate, formatTime } from '../data/dates'

/** البحث الشامل: موظفون، خدمات، وثائق، لقاءات، إدارات */
export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { employees, services, documents, meetings, units } = useMishkah()
  const [q, setQ] = useState('')
  const term = q.trim()

  const results = useMemo(() => {
    if (term.length < 2) return null
    const match = (text: string) => text.includes(term)
    return {
      employees: employees.filter((e) => match(e.name) || match(e.title) || e.expertise.some(match)).slice(0, 5),
      services: services.filter((s) => match(s.name) || match(s.description)).slice(0, 5),
      documents: documents.filter((d) => match(d.title) || match(d.summary)).slice(0, 5),
      meetings: meetings.filter((m) => match(m.title) || match(m.description)).slice(0, 4),
      units: units.filter((u) => match(u.name) || match(u.about)).slice(0, 3),
    }
  }, [term, employees, services, documents, meetings, units])

  const total = results
    ? results.employees.length + results.services.length + results.documents.length + results.meetings.length + results.units.length
    : 0

  return (
    <Modal open={open} onClose={onClose} title="البحث الشامل">
      <div className="relative">
        <Search size={17} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: 'var(--mk-muted)' }} />
        <input
          className="mk-input mk-input-search"
          placeholder="ابحث عن موظف أو خدمة أو وثيقة أو لقاء…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>

      {term.length < 2 && (
        <div className="mt-5">
          <p className="text-xs font-bold mk-muted mb-2">بحث سريع</p>
          <div className="flex flex-wrap gap-2">
            {['حجز قاعة', 'طلب صرف', 'قرار', 'نموذج', 'ورشة'].map((s) => (
              <button key={s} type="button" className="mk-chip" onClick={() => setQ(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {results && total === 0 && (
        <p className="text-sm mk-muted mt-6 text-center py-6">لا توجد نتائج مطابقة لـ «{term}»</p>
      )}

      {results && total > 0 && (
        <div className="mt-5 space-y-5">
          <Group title="الموظفون" icon={<Users size={14} />} show={results.employees.length > 0}>
            {results.employees.map((e) => (
              <Link key={e.id} href={`/mishkah/directory/${e.id}`} onClick={onClose} className="flex items-center gap-3 py-2">
                <Avatar person={e} size={34} />
                <span>
                  <span className="block text-sm font-semibold">{e.name}</span>
                  <span className="block text-xs mk-muted">{e.title}</span>
                </span>
              </Link>
            ))}
          </Group>

          <Group title="الخدمات" icon={<LayoutGrid size={14} />} show={results.services.length > 0}>
            {results.services.map((s) => (
              <Link key={s.id} href={`/mishkah/services/${s.id}`} onClick={onClose} className="block py-2">
                <span className="block text-sm font-semibold">{s.name}</span>
                <span className="block text-xs mk-muted">{categoryLabels[s.category]}</span>
              </Link>
            ))}
          </Group>

          <Group title="الوثائق والقرارات" icon={<FileText size={14} />} show={results.documents.length > 0}>
            {results.documents.map((d) => (
              <Link key={d.id} href={`/mishkah/knowledge/${d.id}`} onClick={onClose} className="block py-2">
                <span className="block text-sm font-semibold">{d.title}</span>
                <span className="block text-xs mk-muted">
                  {docTypeLabels[d.type]} <Dot /> {formatDate(d.issuedAt)}
                </span>
              </Link>
            ))}
          </Group>

          <Group title="اللقاءات" icon={<Calendar size={14} />} show={results.meetings.length > 0}>
            {results.meetings.map((m) => (
              <Link key={m.id} href={`/mishkah/calendar/${m.id}`} onClick={onClose} className="block py-2">
                <span className="block text-sm font-semibold">{m.title}</span>
                <span className="block text-xs mk-muted">
                  {formatDate(m.date)} <Dot /> {formatTime(m.start)}
                </span>
              </Link>
            ))}
          </Group>

          <Group title="الإدارات" icon={<Building2 size={14} />} show={results.units.length > 0}>
            {results.units.map((u) => (
              <Link key={u.id} href={`/mishkah/units/${u.id}`} onClick={onClose} className="block py-2">
                <span className="block text-sm font-semibold">{u.name}</span>
              </Link>
            ))}
          </Group>
        </div>
      )}
    </Modal>
  )
}

function Group({
  title,
  icon,
  show,
  children,
}: {
  title: string
  icon: React.ReactNode
  show: boolean
  children: React.ReactNode
}) {
  if (!show) return null
  return (
    <div>
      <p className="text-xs font-bold mk-muted mb-1 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      <div className="divide-y" style={{ borderColor: 'var(--mk-line)' }}>
        {children}
      </div>
    </div>
  )
}
