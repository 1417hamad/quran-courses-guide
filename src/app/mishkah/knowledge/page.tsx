'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Star, Clock, TrendingUp, ExternalLink, FileText, Eye } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { docTypeLabels, platformLinks } from '@/mishkah/data'
import { Badge, Dot, EmptyState, SectionHeader, Tabs } from '@/mishkah/ui'
import { ar } from '@/mishkah/selectors'
import { formatDate } from '@/mishkah/data/dates'
import type { DocType } from '@/mishkah/types'

type Tab = 'all' | 'decisions' | 'policies' | 'guides' | 'records' | 'favorites' | 'links' | 'faq'

const tabTypes: Record<Tab, DocType[]> = {
  all: [],
  decisions: ['decision', 'circular'],
  policies: ['policy', 'regulation'],
  guides: ['guide', 'form', 'intro'],
  records: ['minutes', 'report'],
  favorites: [],
  links: [],
  faq: ['faq'],
}

export default function KnowledgePage() {
  const { documents, units, currentUser, toggleFavoriteDoc } = useMishkah()
  const [tab, setTab] = useState<Tab>('all')
  // لحظة مرجعية ثابتة لتصفية «آخر ٣٠ يومًا» — تُحسب مرة واحدة حتى يبقى العرض ثابتًا
  const [nowTs] = useState(() => Date.now())
  const [q, setQ] = useState('')
  const [unitId, setUnitId] = useState('all')
  const [period, setPeriod] = useState('all')

  const visible = useMemo(
    () =>
      documents.filter((d) => {
        if (d.visibility === 'managers') {
          return currentUser.roles.some((r) => ['unit_manager', 'executive', 'sysadmin'].includes(r.role))
        }
        if (d.visibility === 'unit') return d.ownerUnitId === currentUser.unitId || currentUser.roles.some((r) => r.role === 'sysadmin')
        return true
      }),
    [documents, currentUser],
  )

  const list = useMemo(() => {
    const term = q.trim()
    return visible.filter((d) => {
      const okTerm = !term || d.title.includes(term) || d.summary.includes(term)
      const okUnit = unitId === 'all' || d.ownerUnitId === unitId
      const types = tabTypes[tab]
      const okTab = tab === 'favorites' ? d.favorite : types.length === 0 ? true : types.includes(d.type)
      const age = (nowTs - new Date(d.issuedAt).getTime()) / 86400000
      const okPeriod = period === 'all' || (period === '30' ? age <= 30 : period === '90' ? age <= 90 : age <= 365)
      return okTerm && okUnit && okTab && okPeriod
    })
  }, [visible, q, unitId, tab, period, nowTs])

  const mostUsed = [...visible].sort((a, b) => b.views - a.views).slice(0, 3)
  const newest = [...visible].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)).slice(0, 3)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">معرفة مشكاة</h1>
        <p className="text-sm mk-muted mt-1">
          مكتبة المركز المؤسسية: القرارات والسياسات واللوائح والأدلة والنماذج والمحاضر والتقارير.
        </p>
      </header>

      <div className="relative">
        <Search size={17} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: 'var(--mk-muted)' }} />
        <input className="mk-input mk-input-search" placeholder="ابحث في الوثائق…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!q && tab === 'all' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="mk-card p-4">
            <SectionHeader title="الأكثر استخدامًا" icon={<TrendingUp size={15} style={{ color: 'var(--mk-gold)' }} />} />
            <div className="space-y-2.5">
              {mostUsed.map((d) => (
                <Link key={d.id} href={`/mishkah/knowledge/${d.id}`} className="block">
                  <p className="text-sm font-semibold mk-clamp-2">{d.title}</p>
                  <p className="text-xs mk-muted flex items-center gap-1 mt-0.5">
                    <Eye size={11} />
                    {ar(d.views)} مشاهدة
                  </p>
                </Link>
              ))}
            </div>
          </div>
          <div className="mk-card p-4">
            <SectionHeader title="آخر ما أُضيف" icon={<Clock size={15} style={{ color: 'var(--mk-primary)' }} />} />
            <div className="space-y-2.5">
              {newest.map((d) => (
                <Link key={d.id} href={`/mishkah/knowledge/${d.id}`} className="block">
                  <p className="text-sm font-semibold mk-clamp-2">{d.title}</p>
                  <p className="text-xs mk-muted mt-0.5">{formatDate(d.issuedAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'الكل' },
          { id: 'decisions', label: 'القرارات والتعاميم' },
          { id: 'policies', label: 'السياسات واللوائح' },
          { id: 'guides', label: 'الأدلة والنماذج' },
          { id: 'records', label: 'المحاضر والتقارير' },
          { id: 'faq', label: 'الأسئلة المتكررة' },
          { id: 'favorites', label: 'المفضلة' },
          { id: 'links', label: 'روابط المنصات' },
        ]}
      />

      {tab === 'links' ? (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {platformLinks.map((l) => (
            <a key={l.id} href={l.href} className="mk-card mk-card-hover p-4 flex items-center gap-3">
              <span className="mk-dot" style={{ background: l.tone, width: 10, height: 10 }} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold truncate">{l.label}</span>
                <span className="block text-xs mk-muted truncate">{l.description}</span>
              </span>
              <ExternalLink size={14} className="mk-muted" />
            </a>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <select className="mk-select flex-1 min-w-40" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="all">كل الإدارات</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <select className="mk-select flex-1 min-w-40" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="all">كل التواريخ</option>
              <option value="30">آخر ٣٠ يومًا</option>
              <option value="90">آخر ٩٠ يومًا</option>
              <option value="365">آخر سنة</option>
            </select>
          </div>

          {list.length === 0 ? (
            <EmptyState title="لا توجد وثائق مطابقة" note="جرّب تعديل البحث أو التصفية." icon={<FileText size={22} />} />
          ) : (
            <div className="space-y-2.5">
              {list.map((d) => {
                const unit = units.find((u) => u.id === d.ownerUnitId)
                const needsAck = d.requiresAck && !d.ackByIds.includes(currentUser.id)
                return (
                  <div key={d.id} className="mk-card mk-card-hover p-4">
                    <div className="flex items-start gap-3">
                      <Link href={`/mishkah/knowledge/${d.id}`} className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge tone="var(--mk-primary)">{docTypeLabels[d.type]}</Badge>
                          {needsAck && <Badge tone="var(--mk-warning)">يتطلب تأكيد الاطلاع</Badge>}
                          {d.visibility !== 'all' && <Badge tone="var(--mk-muted)">وصول محدود</Badge>}
                        </div>
                        <p className="font-bold text-sm leading-6">{d.title}</p>
                        <p className="text-sm mk-muted mt-1 leading-7 mk-clamp-2">{d.summary}</p>
                        <p className="text-xs mk-muted mt-2">
                          {unit?.name} <Dot /> إصدار {ar(d.version)} <Dot /> {formatDate(d.issuedAt)}
                        </p>
                      </Link>
                      <button
                        type="button"
                        className="mk-btn mk-btn-ghost mk-btn-sm shrink-0"
                        onClick={() => toggleFavoriteDoc(d.id)}
                        aria-label="إضافة للمفضلة"
                        style={d.favorite ? { color: 'var(--mk-gold)', borderColor: 'var(--mk-gold)' } : undefined}
                      >
                        <Star size={15} fill={d.favorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
