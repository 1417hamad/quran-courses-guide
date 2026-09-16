'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Clock, Building2, Star } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { serviceCategories } from '@/mishkah/data'
import { categoryLabels, ar } from '@/mishkah/selectors'
import { EmptyState } from '@/mishkah/ui'

export default function ServicesPage() {
  const { services, units } = useMishkah()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')

  const list = useMemo(() => {
    const term = q.trim()
    return services.filter((s) => {
      const okCat = cat === 'all' || s.category === cat
      const okTerm = !term || s.name.includes(term) || s.description.includes(term)
      return okCat && okTerm
    })
  }, [services, q, cat])

  const popular = services.filter((s) => s.popular).slice(0, 4)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">خدمات مشكاة</h1>
        <p className="text-sm mk-muted mt-1">دليل خدمات المركز — ابدأ خدمتك إلكترونيًا وتابع طلبك خطوة بخطوة.</p>
      </header>

      <div className="relative">
        <Search size={17} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: 'var(--mk-muted)' }} />
        <input className="mk-input mk-input-search" placeholder="ابحث في الخدمات…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!q && cat === 'all' && (
        <section>
          <p className="mk-section-title mb-2.5">
            <Star size={15} style={{ color: 'var(--mk-gold-deep)' }} />
            الأكثر استخدامًا
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {popular.map((s) => (
              <Link key={s.id} href={`/mishkah/services/${s.id}`} className="mk-card mk-card-hover p-3.5">
                <p className="text-sm font-bold leading-6">{s.name}</p>
                <p className="text-xs mk-muted mt-1">{ar(s.usageCount)} طلبًا هذا الفصل</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mk-scroll-x">
        <button type="button" className={`mk-chip ${cat === 'all' ? 'mk-chip-active' : ''}`} onClick={() => setCat('all')}>
          جميع الخدمات
        </button>
        {serviceCategories.map((c) => (
          <button key={c.id} type="button" className={`mk-chip ${cat === c.id ? 'mk-chip-active' : ''}`} onClick={() => setCat(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="لا توجد خدمة مطابقة" note="جرّب كلمة أخرى أو اختر تصنيفًا مختلفًا." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((s) => {
            const unit = units.find((u) => u.id === s.ownerUnitId)
            return (
              <Link key={s.id} href={`/mishkah/services/${s.id}`} className="mk-card mk-card-hover p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold leading-7">{s.name}</p>
                  <span className="mk-badge" style={{ background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}>
                    {categoryLabels[s.category]}
                  </span>
                </div>
                <p className="text-sm mk-muted mt-1.5 leading-7 mk-clamp-2 flex-1">{s.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs mk-muted">
                  <span className="flex items-center gap-1">
                    <Building2 size={13} />
                    {unit?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {ar(s.slaDays)} أيام عمل
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
