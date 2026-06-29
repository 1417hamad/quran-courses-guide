'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { TurnstileWidget } from './TurnstileWidget'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Upload, X, Loader2, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { programFormSchema, type ProgramFormData } from '@/lib/validations'
import {
  PROGRAM_TYPES, DEFAULT_PROGRAM_TYPE, DELIVERY_MODES, GENDERS,
  FEE_TYPES, ORGANIZATION_TYPES, AGE_GROUPS, BRANCHES, SCHEDULE_DAYS,
  MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES
} from '@/lib/constants'
import { REGIONS, getCitiesByRegion } from '@/lib/regions'
import { cn } from '@/lib/utils'

type FieldError = { message?: string }

function FieldWrapper({ label, error, required, children }: {
  label: string
  error?: FieldError
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error?.message && (
        <p className="mt-1 text-xs text-red-600">{error.message}</p>
      )}
    </div>
  )
}

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
const selectClass = inputClass
const textareaClass = `${inputClass} resize-none`

export function AddProgramForm() {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [turnstileVerified, setTurnstileVerified] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      program_type: DEFAULT_PROGRAM_TYPE,
      delivery_mode: 'حضوري',
      gender: 'رجال ونساء',
      fee_type: 'مجانية',
      age_groups: [],
      branches: [],
      schedule_days: [],
      show_phone: false,
      agree_accuracy: undefined as unknown as true,
      agree_terms: undefined as unknown as true,
      agree_privacy: undefined as unknown as true,
      agree_responsibility: undefined as unknown as true,
      turnstile_token: process.env.NODE_ENV === 'development' ? 'dev-bypass' : '',
    },
  })

  const watchedRegion = watch('region')
  const watchedDeliveryMode = watch('delivery_mode')
  const watchedFeeType = watch('fee_type')
  const watchedBranches = watch('branches')
  const cities = watchedRegion ? getCitiesByRegion(watchedRegion) : []

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('نوع الملف غير مقبول. يُقبل JPG وPNG وWebP فقط.')
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('حجم الصورة كبير جدًا. الحد الأقصى 5 ميغابايت.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const onSubmit = async (data: ProgramFormData) => {
    if (!imageFile) {
      toast.error('صورة الإعلان مطلوبة')
      return
    }

    try {
      // Step 1: Create program
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'حدث خطأ أثناء حفظ الإعلان')
        return
      }

      const { id: programId, slug } = json

      // Step 2: Upload image
      setUploading(true)
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('program_id', programId)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setUploading(false)

      if (!uploadRes.ok) {
        toast.warning('تم نشر الإعلان، لكن تعذّر رفع الصورة. يمكنك التواصل معنا لإضافتها.')
      } else {
        toast.success('تم نشر إعلانك بنجاح!')
      }

      setSubmitted(true)
      setTimeout(() => router.push(`/programs/${slug}`), 1500)
    } catch {
      toast.error('حدث خطأ غير متوقع. يرجى المحاولة مجددًا.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">تم نشر إعلانك بنجاح!</h2>
        <p className="text-gray-600">جاري تحويلك إلى صفحة الإعلان...</p>
      </div>
    )
  }

  const isInPerson = watchedDeliveryMode === 'حضوري' || watchedDeliveryMode === 'هجين'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

      {/* Section: Basic Info */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          المعلومات الأساسية
        </h2>

        <FieldWrapper label="نوع البرنامج" required>
          <select {...register('program_type')} className={selectClass}>
            {PROGRAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FieldWrapper>

        <FieldWrapper label="اسم الدورة" error={errors.title} required>
          <input
            {...register('title')}
            type="text"
            placeholder="مثال: دورة حفظ القرآن الكريم للرجال"
            className={cn(inputClass, errors.title && 'border-red-300')}
          />
        </FieldWrapper>

        <FieldWrapper label="اسم الجهة المقدمة" error={errors.organization_name} required>
          <input
            {...register('organization_name')}
            type="text"
            placeholder="مثال: جمعية تحفيظ القرآن"
            className={cn(inputClass, errors.organization_name && 'border-red-300')}
          />
        </FieldWrapper>

        <FieldWrapper label="نوع الجهة" error={errors.organization_type} required>
          <select {...register('organization_type')} className={selectClass}>
            <option value="">اختر...</option>
            {ORGANIZATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FieldWrapper>

        <FieldWrapper label="وصف الدورة" error={errors.description} required>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="اكتب وصفًا تفصيليًا للدورة..."
            className={cn(textareaClass, errors.description && 'border-red-300')}
          />
        </FieldWrapper>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            صورة الإعلان <span className="text-red-500">*</span>
          </label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[16/9] max-w-sm">
              <Image src={imagePreview} alt="معاينة" fill className="object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 end-2 bg-red-600 text-white p-1 rounded-lg hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 font-medium">انقر لاختيار صورة</p>
              <p className="text-xs text-gray-400 mt-1">JPG، PNG، WebP — بحد أقصى 5 ميغابايت</p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </section>

      {/* Section: Location */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          الموقع ونمط التنفيذ
        </h2>

        <FieldWrapper label="نمط الدورة" error={errors.delivery_mode} required>
          <div className="flex gap-2">
            {DELIVERY_MODES.map((mode) => (
              <label
                key={mode}
                className={cn(
                  'flex-1 text-center border rounded-lg py-2 text-sm cursor-pointer transition-colors',
                  watchedDeliveryMode === mode
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="radio"
                  value={mode}
                  {...register('delivery_mode')}
                  className="sr-only"
                />
                {mode}
              </label>
            ))}
          </div>
        </FieldWrapper>

        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="المنطقة" error={errors.region} required>
            <select
              {...register('region')}
              onChange={(e) => {
                register('region').onChange(e)
                setValue('city', '')
              }}
              className={cn(selectClass, errors.region && 'border-red-300')}
            >
              <option value="">اختر المنطقة</option>
              {REGIONS.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
          </FieldWrapper>

          <FieldWrapper label="المدينة" error={errors.city} required>
            <select
              {...register('city')}
              disabled={!watchedRegion}
              className={cn(selectClass, errors.city && 'border-red-300', !watchedRegion && 'bg-gray-50 text-gray-400')}
            >
              <option value="">{watchedRegion ? 'اختر المدينة' : 'اختر المنطقة أولًا'}</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FieldWrapper>
        </div>

        {isInPerson && (
          <FieldWrapper label="الحي" error={errors.district} required>
            <input
              {...register('district')}
              type="text"
              placeholder="مثال: العليا"
              className={cn(inputClass, errors.district && 'border-red-300')}
            />
          </FieldWrapper>
        )}

        <FieldWrapper
          label={`رابط الموقع على الخريطة${isInPerson ? '' : ' (اختياري)'}`}
          error={errors.maps_url}
          required={isInPerson}
        >
          <input
            {...register('maps_url')}
            type="url"
            placeholder="https://maps.google.com/..."
            className={cn(inputClass, errors.maps_url && 'border-red-300')}
          />
        </FieldWrapper>
      </section>

      {/* Section: Beneficiaries */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          المستفيدون
        </h2>

        <FieldWrapper label="الجنس المستفيد" error={errors.gender} required>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <label
                key={g}
                className={cn(
                  'flex-1 text-center border rounded-lg py-2 text-sm cursor-pointer transition-colors',
                  watch('gender') === g
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input type="radio" value={g} {...register('gender')} className="sr-only" />
                {g}
              </label>
            ))}
          </div>
        </FieldWrapper>

        <FieldWrapper label="الفئة العمرية" error={errors.age_groups} required>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((group) => {
              const checked = watch('age_groups')?.includes(group)
              return (
                <label
                  key={group}
                  className={cn(
                    'border rounded-full px-3 py-1 text-sm cursor-pointer transition-colors',
                    checked
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Controller
                    name="age_groups"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        value={group}
                        checked={field.value?.includes(group)}
                        onChange={(e) => {
                          const current = field.value || []
                          field.onChange(
                            e.target.checked
                              ? [...current, group]
                              : current.filter((v) => v !== group)
                          )
                        }}
                        className="sr-only"
                      />
                    )}
                  />
                  {group}
                </label>
              )
            })}
          </div>
          {errors.age_groups && (
            <p className="mt-1 text-xs text-red-600">{errors.age_groups.message}</p>
          )}
        </FieldWrapper>
      </section>

      {/* Section: Branches */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          فروع الدورة
        </h2>

        <FieldWrapper label="اختر فرعًا أو أكثر" error={errors.branches} required>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((branch) => {
              const checked = watchedBranches?.includes(branch)
              return (
                <label
                  key={branch}
                  className={cn(
                    'border rounded-full px-3 py-1 text-sm cursor-pointer transition-colors',
                    checked
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Controller
                    name="branches"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        value={branch}
                        checked={field.value?.includes(branch)}
                        onChange={(e) => {
                          const current = field.value || []
                          field.onChange(
                            e.target.checked
                              ? [...current, branch]
                              : current.filter((v) => v !== branch)
                          )
                        }}
                        className="sr-only"
                      />
                    )}
                  />
                  {branch}
                </label>
              )
            })}
          </div>
          {errors.branches && (
            <p className="mt-1 text-xs text-red-600">{errors.branches.message}</p>
          )}
        </FieldWrapper>

        {watchedBranches?.includes('غير ذلك') && (
          <FieldWrapper label="اكتب الفرع" error={errors.custom_branch} required>
            <input
              {...register('custom_branch')}
              type="text"
              placeholder="مثال: قراءات متعددة"
              className={cn(inputClass, errors.custom_branch && 'border-red-300')}
            />
          </FieldWrapper>
        )}
      </section>

      {/* Section: Supervisor & Contact */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          المشرف والتواصل
        </h2>

        <FieldWrapper label="اسم المعلم / المشرف (اختياري)" error={errors.instructor_name}>
          <input
            {...register('instructor_name')}
            type="text"
            placeholder="مثال: الشيخ محمد"
            className={inputClass}
          />
        </FieldWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldWrapper label="رقم التواصل (اختياري)" error={errors.phone}>
            <input
              {...register('phone')}
              type="tel"
              placeholder="05xxxxxxxx"
              className={cn(inputClass, errors.phone && 'border-red-300')}
              dir="ltr"
            />
          </FieldWrapper>

          <FieldWrapper label="رقم واتساب (اختياري)" error={errors.whatsapp_number}>
            <input
              {...register('whatsapp_number')}
              type="tel"
              placeholder="05xxxxxxxx"
              className={inputClass}
              dir="ltr"
            />
          </FieldWrapper>
        </div>

        {watch('phone') && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('show_phone')}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">أوافق على إظهار رقم التواصل للعموم</span>
          </label>
        )}

        <FieldWrapper label="رابط التسجيل" error={errors.registration_url} required>
          <input
            {...register('registration_url')}
            type="url"
            placeholder="https://..."
            className={cn(inputClass, errors.registration_url && 'border-red-300')}
            dir="ltr"
          />
        </FieldWrapper>
      </section>

      {/* Section: Schedule */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          المواعيد
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FieldWrapper label="تاريخ البداية" error={errors.start_date} required>
            <input
              {...register('start_date')}
              type="date"
              className={cn(inputClass, errors.start_date && 'border-red-300')}
            />
          </FieldWrapper>

          <FieldWrapper label="تاريخ النهاية" error={errors.end_date} required>
            <input
              {...register('end_date')}
              type="date"
              className={cn(inputClass, errors.end_date && 'border-red-300')}
            />
          </FieldWrapper>

          <FieldWrapper label="آخر موعد للتسجيل" error={errors.registration_deadline} required>
            <input
              {...register('registration_deadline')}
              type="date"
              className={cn(inputClass, errors.registration_deadline && 'border-red-300')}
            />
          </FieldWrapper>
        </div>

        <FieldWrapper label="أيام الدورة (اختياري)">
          <div className="flex flex-wrap gap-2">
            {SCHEDULE_DAYS.map((day) => {
              const checked = watch('schedule_days')?.includes(day)
              return (
                <label
                  key={day}
                  className={cn(
                    'border rounded-full px-3 py-1 text-sm cursor-pointer transition-colors',
                    checked
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Controller
                    name="schedule_days"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        value={day}
                        checked={field.value?.includes(day)}
                        onChange={(e) => {
                          const current = field.value || []
                          field.onChange(
                            e.target.checked
                              ? [...current, day]
                              : current.filter((v) => v !== day)
                          )
                        }}
                        className="sr-only"
                      />
                    )}
                  />
                  {day}
                </label>
              )
            })}
          </div>
        </FieldWrapper>

        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="وقت البداية (اختياري)">
            <input {...register('start_time')} type="time" className={inputClass} />
          </FieldWrapper>
          <FieldWrapper label="وقت النهاية (اختياري)">
            <input {...register('end_time')} type="time" className={inputClass} />
          </FieldWrapper>
        </div>
      </section>

      {/* Section: Fees */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          الرسوم
        </h2>

        <FieldWrapper label="نوع الرسوم" required>
          <div className="flex gap-3">
            {FEE_TYPES.map((type) => (
              <label
                key={type}
                className={cn(
                  'flex-1 text-center border rounded-lg py-2.5 text-sm cursor-pointer transition-colors',
                  watchedFeeType === type
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input type="radio" value={type} {...register('fee_type')} className="sr-only" />
                {type}
              </label>
            ))}
          </div>
        </FieldWrapper>

        {watchedFeeType === 'مدفوعة' && (
          <FieldWrapper label="قيمة الرسوم (ريال سعودي)" error={errors.fee_amount} required>
            <input
              {...register('fee_amount', { valueAsNumber: true })}
              type="number"
              min="1"
              step="1"
              placeholder="مثال: 200"
              className={cn(inputClass, errors.fee_amount && 'border-red-300')}
            />
          </FieldWrapper>
        )}
      </section>

      {/* Section: Agreements */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          الموافقات الإلزامية
        </h2>

        {[
          { name: 'agree_accuracy' as const, label: 'أقرّ بصحة جميع المعلومات المدخلة' },
          { name: 'agree_terms' as const, label: 'أوافق على شروط الاستخدام' },
          { name: 'agree_privacy' as const, label: 'أوافق على سياسة الخصوصية' },
          {
            name: 'agree_responsibility' as const,
            label: 'أقرّ بأن الجهة المعلنة مسؤولة عن محتوى الإعلان وصحة بياناته',
          },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register(name)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
            {errors[name] && (
              <p className="text-xs text-red-600 mt-0.5 ms-6">{errors[name]?.message}</p>
            )}
          </div>
        ))}
      </section>

      {/* Turnstile */}
      {process.env.NODE_ENV !== 'development' && (
        <TurnstileWidget
          onVerify={(token) => {
            setValue('turnstile_token', token)
            setTurnstileVerified(true)
          }}
          onExpire={() => {
            setValue('turnstile_token', '')
            setTurnstileVerified(false)
          }}
        />
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || uploading || (process.env.NODE_ENV !== 'development' && !turnstileVerified)}
        className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-base hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {(isSubmitting || uploading) ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {uploading ? 'جاري رفع الصورة...' : 'جاري النشر...'}
          </>
        ) : (
          'نشر الإعلان'
        )}
      </button>
    </form>
  )
}
