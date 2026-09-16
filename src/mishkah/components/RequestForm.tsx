'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Paperclip, Save, X } from 'lucide-react'
import { useMishkah } from '../store'
import type { FieldDef, Service } from '../types'
import { Avatar, Dot, InfoRow, Modal } from '../ui'
import { ar, formatFieldValue } from '../selectors'
import { formatDate, formatTime } from '../data/dates'

/** ملفات تجريبية يمكن «إرفاقها» داخل النموذج */
const demoFiles = [
  { name: 'فاتورة-المورّد.pdf', size: '٣٤٠ ك.ب' },
  { name: 'عرض-سعر.pdf', size: '٥١٠ ك.ب' },
  { name: 'جدول-اللقاء.docx', size: '٩٨ ك.ب' },
]

/** هل يظهر الحقل بحسب قيم الحقول السابقة؟ */
function visible(field: FieldDef, values: Record<string, string>): boolean {
  if (!field.showIf) return true
  return field.showIf.equals.includes(values[field.showIf.key] ?? '')
}

export function RequestForm({ service, onClose }: { service: Service; onClose: () => void }) {
  const router = useRouter()
  const { currentUser, units, employees, submitRequest } = useMishkah()
  const [values, setValues] = useState<Record<string, string>>({})
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([])
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  const unit = units.find((u) => u.id === currentUser.unitId)
  const owner = employees.find((e) => e.id === service.ownerId)
  const steps = useMemo(() => {
    const max = Math.max(...service.form.map((f) => f.step ?? 1))
    return Array.from({ length: max }, (_, i) => i + 1)
  }, [service.form])
  const lastStep = steps.length + 1 // الخطوة الأخيرة هي المعاينة

  const fieldsOf = (n: number) => service.form.filter((f) => (f.step ?? 1) === n && visible(f, values))

  function setValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  function validateStep(n: number): boolean {
    const next: Record<string, string> = {}
    for (const f of fieldsOf(n)) {
      if (f.type === 'file') {
        if (f.required && attachments.length === 0) next[f.key] = 'يلزم إرفاق ملف لإتمام الطلب'
        continue
      }
      if (f.required && !(values[f.key] ?? '').trim()) next[f.key] = 'هذا الحقل مطلوب'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function next() {
    if (step <= steps.length && !validateStep(step)) return
    setStep((s) => Math.min(lastStep, s + 1))
  }

  function send(asDraft = false) {
    if (!asDraft) {
      for (const n of steps) {
        if (!validateStep(n)) {
          setStep(n)
          return
        }
      }
    }
    setSending(true)
    setTimeout(() => {
      const created = submitRequest(service.id, values, attachments, asDraft)
      setSending(false)
      setDone(created.id)
    }, 850)
  }

  if (done) {
    const request = done
    return (
      <div className="text-center py-4">
        <span
          className="mk-avatar mx-auto mb-4"
          style={{ width: 64, height: 64, background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}
        >
          <CheckCircle2 size={32} />
        </span>
        <h3 className="text-lg font-bold">تم استلام طلبك بنجاح</h3>
        <p className="text-sm mk-muted mt-2 leading-7 max-w-sm mx-auto">
          سيصلك إشعار عند كل تحديث. المدة المستهدفة لإنجاز «{service.name}» هي {ar(service.slaDays)} أيام عمل،
          والجهة المسؤولة {owner?.name}.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
          <button
            type="button"
            className="mk-btn mk-btn-primary"
            onClick={() => {
              onClose()
              router.push(`/mishkah/office/requests/${request}`)
            }}
          >
            متابعة حالة الطلب
          </button>
          <button type="button" className="mk-btn mk-btn-ghost" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* شريط الخطوات */}
      <div className="flex items-center gap-1.5 mb-5">
        {[...steps, lastStep].map((n) => (
          <span
            key={n}
            className="h-1.5 flex-1 rounded-full transition"
            style={{ background: n <= step ? 'var(--mk-primary)' : 'var(--mk-line)' }}
          />
        ))}
      </div>
      <p className="text-xs mk-muted mb-4">
        الخطوة {ar(step)} من {ar(lastStep)} —{' '}
        {step === lastStep ? 'معاينة الطلب قبل الإرسال' : step === 1 ? 'بيانات الطلب الأساسية' : 'تفاصيل إضافية ومرفقات'}
      </p>

      {step === 1 && (
        <div className="rounded-2xl p-3.5 mb-4 flex items-center gap-3" style={{ background: 'var(--mk-primary-tint)' }}>
          <Avatar person={currentUser} size={40} />
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{currentUser.name}</p>
            <p className="text-xs mk-muted truncate">
              {currentUser.title} <Dot /> {unit?.name}
            </p>
          </div>
          <span className="mk-badge mr-auto" style={{ background: 'var(--mk-surface)', color: 'var(--mk-muted)' }}>
            تُعبّأ تلقائيًا
          </span>
        </div>
      )}

      {step <= steps.length && (
        <div className="space-y-4">
          {fieldsOf(step).map((f) => (
            <Field
              key={f.key}
              field={f}
              value={values[f.key] ?? ''}
              error={errors[f.key]}
              onChange={(v) => setValue(f.key, v)}
              attachments={attachments}
              onAttach={(file) => setAttachments((a) => (a.some((x) => x.name === file.name) ? a : [...a, file]))}
              onRemoveAttach={(name) => setAttachments((a) => a.filter((x) => x.name !== name))}
            />
          ))}
        </div>
      )}

      {step === lastStep && (
        <div className="mk-card p-4">
          <p className="font-bold text-sm mb-2">{service.name}</p>
          <InfoRow label="مقدّم الطلب" value={currentUser.name} />
          <InfoRow label="الإدارة" value={unit?.name ?? '—'} />
          {service.form
            .filter((f) => visible(f, values) && f.type !== 'file' && (values[f.key] ?? '').trim())
            .map((f) => (
              <InfoRow
                key={f.key}
                label={f.label}
                value={formatFieldValue(f.type, values[f.key], { date: formatDate, time: formatTime })}
              />
            ))}
          <InfoRow
            label="المرفقات"
            value={attachments.length ? attachments.map((a) => a.name).join('، ') : 'لا توجد'}
          />
          <InfoRow label="المدة المستهدفة" value={`${ar(service.slaDays)} أيام عمل`} />
          <InfoRow label="مسار الاعتماد" value={service.approvalChain.join(' ← ')} />
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="flex items-center gap-2 mt-6">
        {step > 1 && (
          <button type="button" className="mk-btn mk-btn-ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowRight size={16} />
            السابق
          </button>
        )}
        <button
          type="button"
          className="mk-btn mk-btn-ghost mk-btn-sm"
          onClick={() => send(true)}
          disabled={sending}
          title="حفظ الطلب كمسودة للعودة إليه لاحقًا"
        >
          <Save size={15} />
          حفظ كمسودة
        </button>
        <span className="flex-1" />
        {step < lastStep ? (
          <button type="button" className="mk-btn mk-btn-primary" onClick={next}>
            التالي
            <ArrowLeft size={16} />
          </button>
        ) : (
          <button type="button" className="mk-btn mk-btn-primary" onClick={() => send(false)} disabled={sending}>
            {sending && <span className="mk-spinner" />}
            {sending ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({
  field,
  value,
  error,
  onChange,
  attachments,
  onAttach,
  onRemoveAttach,
}: {
  field: FieldDef
  value: string
  error?: string
  onChange: (v: string) => void
  attachments: { name: string; size: string }[]
  onAttach: (f: { name: string; size: string }) => void
  onRemoveAttach: (name: string) => void
}) {
  const id = `fld-${field.key}`

  if (field.type === 'checkbox') {
    return (
      <label className="mk-check">
        <input type="checkbox" checked={value === 'نعم'} onChange={(e) => onChange(e.target.checked ? 'نعم' : 'لا')} />
        <span>{field.label}</span>
      </label>
    )
  }

  if (field.type === 'file') {
    return (
      <div>
        <label className="mk-label">
          {field.label}
          {field.required && <span style={{ color: 'var(--mk-danger)' }}> *</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {demoFiles.map((f) => (
            <button key={f.name} type="button" className="mk-chip" onClick={() => onAttach(f)}>
              <Paperclip size={13} />
              {f.name}
            </button>
          ))}
        </div>
        {attachments.length > 0 && (
          <ul className="mt-2.5 space-y-1.5">
            {attachments.map((a) => (
              <li
                key={a.name}
                className="flex items-center gap-2 text-sm rounded-xl px-3 py-2"
                style={{ background: 'var(--mk-primary-tint)' }}
              >
                <Paperclip size={14} style={{ color: 'var(--mk-primary)' }} />
                <span className="flex-1 truncate font-semibold">{a.name}</span>
                <span className="text-xs mk-muted">{a.size}</span>
                <button type="button" onClick={() => onRemoveAttach(a.name)} aria-label="إزالة المرفق">
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {field.hint && <p className="mk-hint">{field.hint}</p>}
        {error && <p className="mk-error">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <label className="mk-label" htmlFor={id}>
        {field.label}
        {field.required && <span style={{ color: 'var(--mk-danger)' }}> *</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea id={id} className="mk-textarea" placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === 'select' ? (
        <select id={id} className="mk-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">اختر…</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          className="mk-input"
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.hint && <p className="mk-hint">{field.hint}</p>}
      {error && <p className="mk-error">{error}</p>}
    </div>
  )
}

/** غلاف يفتح النموذج داخل نافذة */
export function RequestFormModal({
  service,
  open,
  onClose,
}: {
  service: Service
  open: boolean
  onClose: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title={service.name}>
      <RequestForm service={service} onClose={onClose} />
    </Modal>
  )
}
