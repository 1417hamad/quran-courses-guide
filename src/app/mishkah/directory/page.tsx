'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Clock } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { Avatar, Badge, EmptyState } from '@/mishkah/ui'
import { ar, roleNames } from '@/mishkah/selectors'

export default function DirectoryPage() {
  const { employees, units, teams } = useMishkah()
  const [q, setQ] = useState('')
  const [unitId, setUnitId] = useState('all')

  const list = useMemo(() => {
    const term = q.trim()
    return employees.filter((e) => {
      const okTerm =
        !term || e.name.includes(term) || e.title.includes(term) || e.expertise.some((x) => x.includes(term)) || e.bio.includes(term)
      const okUnit = unitId === 'all' || e.unitId === unitId
      return okTerm && okUnit
    })
  }, [employees, q, unitId])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">دليل الموظفين</h1>
        <p className="text-sm mk-muted mt-1">
          تعرّف على زملائك ومجالات عملهم وأوقاتهم المعتادة والموضوعات التي يمكن الرجوع إليهم فيها.
        </p>
      </header>

      <div className="relative">
        <Search size={17} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: 'var(--mk-muted)' }} />
        <input className="mk-input mk-input-search" placeholder="ابحث بالاسم أو المسمى أو المجال…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mk-scroll-x">
        <button type="button" className={`mk-chip ${unitId === 'all' ? 'mk-chip-active' : ''}`} onClick={() => setUnitId('all')}>
          كل الإدارات
        </button>
        {units.map((u) => (
          <button key={u.id} type="button" className={`mk-chip ${unitId === u.id ? 'mk-chip-active' : ''}`} onClick={() => setUnitId(u.id)}>
            {u.name}
          </button>
        ))}
      </div>

      <p className="text-sm mk-muted">{ar(list.length)} موظفًا</p>

      {list.length === 0 ? (
        <EmptyState title="لا يوجد موظف مطابق" note="جرّب اسمًا أو مجالًا آخر." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((e) => {
            const unit = units.find((u) => u.id === e.unitId)
            const myTeams = teams.filter((t) => e.teamIds.includes(t.id))
            return (
              <Link key={e.id} href={`/mishkah/directory/${e.id}`} className="mk-card mk-card-hover p-4">
                <div className="flex items-start gap-3">
                  <Avatar person={e} size={46} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{e.name}</p>
                    <p className="text-xs mk-muted truncate">{e.title}</p>
                    <p className="text-xs mk-muted mt-0.5 truncate">{unit?.name}</p>
                  </div>
                  {e.isNew && <Badge tone="var(--mk-gold)">جديد</Badge>}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {e.expertise.slice(0, 3).map((x) => (
                    <span key={x} className="mk-badge" style={{ background: 'var(--mk-primary-tint)', color: 'var(--mk-muted)' }}>
                      {x}
                    </span>
                  ))}
                </div>

                <p className="text-xs mk-muted mt-2.5 flex items-center gap-1.5">
                  <Clock size={12} />
                  {e.workDays.join('، ')}
                </p>

                {myTeams.length > 0 && (
                  <p className="text-xs mk-muted mt-1 truncate">فرقه: {myTeams.map((t) => t.name).join('، ')}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {roleNames(e)
                    .filter((r) => r !== 'موظف')
                    .map((r) => (
                      <Badge key={r} tone="var(--mk-primary)">
                        {r}
                      </Badge>
                    ))}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
