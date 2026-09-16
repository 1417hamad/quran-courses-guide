'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Building2, Users, UserPlus, Megaphone, FileText, BarChart3, Plus, Eye, EyeOff } from 'lucide-react'
import { useMishkah } from '@/mishkah/store'
import { serviceCategories } from '@/mishkah/data'
import { Avatar, Badge, Dot, EmptyState, Modal, SectionHeader, Tabs } from '@/mishkah/ui'
import { ar, roleLabels, categoryLabels, teamKindLabels } from '@/mishkah/selectors'
import type { RoleKey, Service, Team } from '@/mishkah/types'

type Tab = 'structure' | 'people' | 'services' | 'content' | 'reports'

/** أقسام الصفحة الرئيسة القابلة للتحكم */
const homeSections = [
  { id: 'meetings', label: 'لقاءات اليوم والأسبوع' },
  { id: 'decisions', label: 'القرارات الجديدة' },
  { id: 'requests', label: 'طلباتي المفتوحة' },
  { id: 'newcomers', label: 'الموظفون الجدد' },
  { id: 'achievements', label: 'منجزات الإدارات' },
  { id: 'shortcuts', label: 'اختصارات الخدمات' },
]

export default function AdminPage() {
  const { currentUser, units, teams, employees, services, requests, posts, documents, toast } = useMishkah()
  const [tab, setTab] = useState<Tab>('structure')
  const [modal, setModal] = useState<'unit' | 'team' | 'employee' | 'role' | 'service' | 'announce' | null>(null)
  const [sections, setSections] = useState<string[]>(homeSections.map((s) => s.id))

  const isAdmin = currentUser.roles.some((r) => r.role === 'sysadmin')
  if (!isAdmin) {
    return (
      <EmptyState
        title="لوحة مدير النظام غير متاحة لدورك الحالي"
        note="بدّل الدور إلى «مدير النظام» من قائمة الحساب لتجربة هذه اللوحة."
        icon={<Shield size={22} />}
        action={
          <Link href="/mishkah" className="mk-link mt-2">
            العودة للصفحة الرئيسة
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield size={20} style={{ color: 'var(--mk-primary)' }} />
          لوحة مدير النظام
        </h1>
        <p className="text-sm mk-muted mt-1">
          إدارة الهيكل والخدمات والصلاحيات والمحتوى — المنصة قابلة للتوسع دون إعادة برمجة.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Kpi label="إدارة" value={units.length} />
        <Kpi label="فريق ولجنة" value={teams.length} />
        <Kpi label="موظف" value={employees.length} />
        <Kpi label="خدمة" value={services.length} />
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        items={[
          { id: 'structure', label: 'الهيكل التنظيمي' },
          { id: 'people', label: 'الموظفون والصلاحيات' },
          { id: 'services', label: 'الخدمات' },
          { id: 'content', label: 'المحتوى والصفحة الرئيسة' },
          { id: 'reports', label: 'تقارير الاستخدام' },
        ]}
      />

      {tab === 'structure' && (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="mk-btn mk-btn-primary mk-btn-sm" onClick={() => setModal('unit')}>
              <Plus size={15} />
              إضافة إدارة
            </button>
            <button type="button" className="mk-btn mk-btn-soft mk-btn-sm" onClick={() => setModal('team')}>
              <Plus size={15} />
              إنشاء فريق أو لجنة
            </button>
          </div>

          <div>
            <SectionHeader title="الإدارات" icon={<Building2 size={16} />} />
            <div className="space-y-2.5">
              {units.map((u) => {
                const manager = employees.find((e) => e.id === u.managerId)
                const count = employees.filter((e) => e.unitId === u.id).length
                return (
                  <div key={u.id} className="mk-card p-4 flex items-center gap-3">
                    <span className="mk-avatar" style={{ width: 38, height: 38, background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}>
                      <Building2 size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link href={`/mishkah/units/${u.id}`} className="block text-sm font-bold truncate hover:underline">
                        {u.name}
                      </Link>
                      <span className="block text-xs mk-muted truncate">
                        المدير: {manager?.name ?? 'غير معيّن'} <Dot /> {ar(count)} أعضاء <Dot /> {ar(u.serviceIds.length)} خدمات
                      </span>
                    </span>
                    <button
                      type="button"
                      className="mk-btn mk-btn-ghost mk-btn-sm"
                      onClick={() => toast('تعديل الإدارة متاح في النسخة الكاملة', 'info')}
                    >
                      تعديل
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <SectionHeader title="الفرق واللجان" icon={<Users size={16} />} />
            <div className="grid sm:grid-cols-2 gap-2.5">
              {teams.map((t: Team) => (
                <Link key={t.id} href={`/mishkah/teams/${t.id}`} className="mk-card mk-card-hover p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold">{t.name}</p>
                    <Badge tone={t.status === 'active' ? 'var(--mk-success)' : 'var(--mk-muted)'}>
                      {t.status === 'active' ? 'نشط' : 'مؤرشف'}
                    </Badge>
                  </div>
                  <p className="text-xs mk-muted mt-1">
                    {teamKindLabels[t.kind]} <Dot /> {ar(t.memberIds.length)} أعضاء
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === 'people' && (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="mk-btn mk-btn-primary mk-btn-sm" onClick={() => setModal('employee')}>
              <UserPlus size={15} />
              إضافة موظف
            </button>
            <button type="button" className="mk-btn mk-btn-soft mk-btn-sm" onClick={() => setModal('role')}>
              <Shield size={15} />
              منح دور أو صلاحية
            </button>
          </div>

          <div className="space-y-2.5">
            {employees.map((e) => {
              const unit = units.find((u) => u.id === e.unitId)
              return (
                <div key={e.id} className="mk-card p-3.5 flex items-center gap-3">
                  <Avatar person={e} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold truncate">{e.name}</span>
                    <span className="block text-xs mk-muted truncate">
                      {e.title} <Dot /> {unit?.name}
                    </span>
                  </span>
                  <span className="hidden sm:flex flex-wrap gap-1 justify-end max-w-[40%]">
                    {Array.from(new Set(e.roles.map((r) => r.role))).map((r) => (
                      <Badge key={r} tone="var(--mk-primary)">
                        {roleLabels[r]}
                      </Badge>
                    ))}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {tab === 'services' && (
        <section className="space-y-4">
          <button type="button" className="mk-btn mk-btn-primary mk-btn-sm" onClick={() => setModal('service')}>
            <Plus size={15} />
            إنشاء خدمة جديدة
          </button>

          <div className="space-y-2.5">
            {services.map((s: Service) => {
              const unit = units.find((u) => u.id === s.ownerUnitId)
              const owner = employees.find((e) => e.id === s.ownerId)
              return (
                <div key={s.id} className="mk-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/mishkah/services/${s.id}`} className="font-bold text-sm hover:underline">
                      {s.name}
                    </Link>
                    <Badge tone="var(--mk-primary)">{categoryLabels[s.category]}</Badge>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 mt-2.5 text-xs mk-muted">
                    <span>الجهة: {unit?.name}</span>
                    <span>المسؤول: {owner?.name}</span>
                    <span>المدة المستهدفة: {ar(s.slaDays)} أيام</span>
                  </div>
                  <p className="text-xs mk-muted mt-2">مسار الموافقات: {s.approvalChain.join(' ← ')}</p>
                  <p className="text-xs mk-muted mt-1">عدد حقول النموذج: {ar(s.form.length)}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {tab === 'content' && (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="mk-btn mk-btn-primary mk-btn-sm" onClick={() => setModal('announce')}>
              <Megaphone size={15} />
              نشر إعلان رسمي
            </button>
            <Link href="/mishkah/knowledge" className="mk-btn mk-btn-soft mk-btn-sm">
              <FileText size={15} />
              إدارة القرارات والوثائق
            </Link>
          </div>

          <div>
            <SectionHeader title="أقسام الصفحة الرئيسة" />
            <p className="text-sm mk-muted mb-3 leading-7">تحكّم في ما يظهر للموظفين على صفحة «مجتمع مشكاة».</p>
            <div className="space-y-2">
              {homeSections.map((s) => {
                const on = sections.includes(s.id)
                return (
                  <div key={s.id} className="mk-card p-3.5 flex items-center gap-3">
                    <span className="text-sm font-semibold flex-1">{s.label}</span>
                    <button
                      type="button"
                      className={`mk-btn mk-btn-sm ${on ? 'mk-btn-soft' : 'mk-btn-ghost'}`}
                      onClick={() => {
                        setSections((cur) => (on ? cur.filter((x) => x !== s.id) : [...cur, s.id]))
                        toast(on ? `أُخفي قسم «${s.label}»` : `أُظهر قسم «${s.label}»`, 'info')
                      }}
                    >
                      {on ? <Eye size={14} /> : <EyeOff size={14} />}
                      {on ? 'ظاهر' : 'مخفي'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {tab === 'reports' && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Kpi label="طلب مقدّم" value={requests.length} />
            <Kpi label="منشور على الحائط" value={posts.length} />
            <Kpi label="وثيقة في المكتبة" value={documents.length} />
            <Kpi label="قرار يتطلب اطلاعًا" value={documents.filter((d) => d.requiresAck).length} />
          </div>
          <Link href="/mishkah/insights" className="mk-card mk-card-hover p-4 flex items-center gap-3">
            <span className="mk-avatar" style={{ width: 40, height: 40, background: 'var(--mk-gold-soft)', color: 'var(--mk-warning)' }}>
              <BarChart3 size={19} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold">لوحة المؤشرات التفصيلية</span>
              <span className="block text-xs mk-muted">مؤشرات الأداء والاستخدام للإدارة العليا</span>
            </span>
          </Link>
        </section>
      )}

      <AdminModals modal={modal} close={() => setModal(null)} />
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="mk-card p-3.5 text-center">
      <p className="text-xl font-bold" style={{ color: 'var(--mk-primary)' }}>
        {ar(value)}
      </p>
      <p className="text-xs mk-muted mt-0.5">{label}</p>
    </div>
  )
}

/** حقول لوحة الإدارة — تربط كل تسمية بحقلها لتعمل قارئات الشاشة والتنقل بلوحة المفاتيح */
function LabeledInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  const id = `adm-${label}`
  return (
    <>
      <label className="mk-label mt-4 first:mt-0" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="mk-input" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </>
  )
}

function LabeledTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = `adm-${label}`
  return (
    <>
      <label className="mk-label mt-4 first:mt-0" htmlFor={id}>
        {label}
      </label>
      <textarea id={id} className="mk-textarea" value={value} onChange={(e) => onChange(e.target.value)} />
    </>
  )
}

function LabeledSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  const id = `adm-${label}`
  return (
    <>
      <label className="mk-label mt-4 first:mt-0" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="mk-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </>
  )
}

/** نوافذ الإضافة في لوحة الإدارة */
function AdminModals({ modal, close }: { modal: string | null; close: () => void }) {
  const { units, employees, addUnit, addTeam, addEmployee, grantRole, addService, publishAnnouncement } = useMishkah()
  const [form, setForm] = useState<Record<string, string>>({})
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const done = () => {
    setForm({})
    close()
  }

  return (
    <>
      <Modal
        open={modal === 'unit'}
        onClose={close}
        title="إضافة إدارة جديدة"
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={close}>
              إلغاء
            </button>
            <button
              type="button"
              className="mk-btn mk-btn-primary"
              disabled={!form.name || !form.managerId}
              onClick={() => {
                addUnit({ name: form.name, managerId: form.managerId, about: form.about ?? 'إدارة جديدة في المركز.' })
                done()
              }}
            >
              إضافة
            </button>
          </>
        }
      >
        <LabeledInput label="اسم الإدارة" value={form.name ?? ''} onChange={(v) => set('name', v)} placeholder="مثال: إدارة الشراكات" />
        <LabeledSelect label="مدير الإدارة" value={form.managerId ?? ''} onChange={(v) => set('managerId', v)}>
          <option value="">اختر الموظف…</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </LabeledSelect>
        <LabeledTextarea label="تعريف مختصر" value={form.about ?? ''} onChange={(v) => set('about', v)} />
      </Modal>

      <Modal
        open={modal === 'team'}
        onClose={close}
        title="إنشاء فريق أو لجنة"
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={close}>
              إلغاء
            </button>
            <button
              type="button"
              className="mk-btn mk-btn-primary"
              disabled={!form.name || !form.leadId}
              onClick={() => {
                addTeam({
                  name: form.name,
                  kind: (form.kind as Team['kind']) ?? 'committee',
                  leadId: form.leadId,
                  unitId: form.unitId || undefined,
                  about: form.about ?? 'فريق جديد.',
                })
                done()
              }}
            >
              إنشاء
            </button>
          </>
        }
      >
        <LabeledInput label="اسم الفريق" value={form.name ?? ''} onChange={(v) => set('name', v)} />
        <LabeledSelect label="النوع" value={form.kind ?? 'committee'} onChange={(v) => set('kind', v)}>
          {Object.entries(teamKindLabels).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect label="الإدارة التابع لها (اختياري)" value={form.unitId ?? ''} onChange={(v) => set('unitId', v)}>
          <option value="">بدون</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect label="قائد الفريق" value={form.leadId ?? ''} onChange={(v) => set('leadId', v)}>
          <option value="">اختر…</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </LabeledSelect>
        <LabeledTextarea label="وصف مختصر" value={form.about ?? ''} onChange={(v) => set('about', v)} />
      </Modal>

      <Modal
        open={modal === 'employee'}
        onClose={close}
        title="إضافة موظف"
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={close}>
              إلغاء
            </button>
            <button
              type="button"
              className="mk-btn mk-btn-primary"
              disabled={!form.name || !form.title || !form.unitId}
              onClick={() => {
                addEmployee({ name: form.name, title: form.title, unitId: form.unitId })
                done()
              }}
            >
              إضافة
            </button>
          </>
        }
      >
        <LabeledInput label="الاسم" value={form.name ?? ''} onChange={(v) => set('name', v)} placeholder="مثال: أحمد بن سالم الزهراني" />
        <LabeledInput label="المسمى الوظيفي" value={form.title ?? ''} onChange={(v) => set('title', v)} />
        <LabeledSelect label="الإدارة" value={form.unitId ?? ''} onChange={(v) => set('unitId', v)}>
          <option value="">اختر…</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </LabeledSelect>
      </Modal>

      <Modal
        open={modal === 'role'}
        onClose={close}
        title="منح دور أو صلاحية"
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={close}>
              إلغاء
            </button>
            <button
              type="button"
              className="mk-btn mk-btn-primary"
              disabled={!form.employeeId || !form.role}
              onClick={() => {
                grantRole(form.employeeId, form.role as RoleKey, form.scopeRef ?? '')
                done()
              }}
            >
              منح الصلاحية
            </button>
          </>
        }
      >
        <LabeledSelect label="الموظف" value={form.employeeId ?? ''} onChange={(v) => set('employeeId', v)}>
          <option value="">اختر…</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect label="الدور" value={form.role ?? ''} onChange={(v) => set('role', v)}>
          <option value="">اختر…</option>
          {(['unit_manager', 'team_lead', 'service_owner', 'executive', 'sysadmin'] as RoleKey[]).map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect label="نطاق الصلاحية" value={form.scopeRef ?? ''} onChange={(v) => set('scopeRef', v)}>
          <option value="">المركز كاملًا</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </LabeledSelect>
        <p className="mk-hint">النطاق يحدد أين تسري الصلاحية: المركز كاملًا، أو إدارة، أو فريق، أو خدمة محددة.</p>
      </Modal>

      <Modal
        open={modal === 'service'}
        onClose={close}
        title="إنشاء خدمة جديدة"
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={close}>
              إلغاء
            </button>
            <button
              type="button"
              className="mk-btn mk-btn-primary"
              disabled={!form.name || !form.ownerUnitId || !form.ownerId}
              onClick={() => {
                addService({
                  name: form.name,
                  category: (form.category as Service['category']) ?? 'admin',
                  description: form.description ?? 'خدمة جديدة.',
                  ownerUnitId: form.ownerUnitId,
                  ownerId: form.ownerId,
                  slaDays: Number(form.slaDays || 3),
                  approvalChain: (form.chain ?? 'مدير الإدارة، مسؤول الخدمة').split('،').map((s) => s.trim()),
                })
                done()
              }}
            >
              إنشاء الخدمة
            </button>
          </>
        }
      >
        <LabeledInput label="اسم الخدمة" value={form.name ?? ''} onChange={(v) => set('name', v)} placeholder="مثال: طلب مركبة" />
        <LabeledSelect label="التصنيف" value={form.category ?? 'admin'} onChange={(v) => set('category', v)}>
          {serviceCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </LabeledSelect>
        <LabeledTextarea label="وصف مختصر" value={form.description ?? ''} onChange={(v) => set('description', v)} />
        <LabeledSelect label="الإدارة المسؤولة" value={form.ownerUnitId ?? ''} onChange={(v) => set('ownerUnitId', v)}>
          <option value="">اختر…</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect label="مسؤول الخدمة" value={form.ownerId ?? ''} onChange={(v) => set('ownerId', v)}>
          <option value="">اختر…</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </LabeledSelect>
        <LabeledInput label="المدة المستهدفة (أيام عمل)" type="number" value={form.slaDays ?? '3'} onChange={(v) => set('slaDays', v)} />
        <LabeledInput label="مسار الموافقات (افصل بفاصلة)" value={form.chain ?? 'مدير الإدارة، مسؤول الخدمة'} onChange={(v) => set('chain', v)} />
        <p className="mk-hint">يُنشأ للخدمة نموذج مبدئي (الموضوع، التفاصيل، التاريخ، المرفقات) قابل للتوسعة.</p>
      </Modal>

      <Modal
        open={modal === 'announce'}
        onClose={close}
        title="نشر إعلان رسمي"
        footer={
          <>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={close}>
              إلغاء
            </button>
            <button
              type="button"
              className="mk-btn mk-btn-primary"
              disabled={!form.body || form.body.trim().length < 10}
              onClick={() => {
                publishAnnouncement(form.body.trim())
                done()
              }}
            >
              نشر
            </button>
          </>
        }
      >
        <LabeledTextarea label="نص الإعلان" value={form.body ?? ''} onChange={(v) => set('body', v)} />
        <p className="mk-hint">يُنشر الإعلان مثبّتًا في أعلى الصفحة الرئيسة لجميع موظفي المركز.</p>
      </Modal>
    </>
  )
}
