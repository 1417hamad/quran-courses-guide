import { z } from 'zod'
import {
  PROGRAM_TYPES,
  DELIVERY_MODES,
  GENDERS,
  FEE_TYPES,
  ORGANIZATION_TYPES,
  AGE_GROUPS,
  BRANCHES,
  REPORT_REASONS,
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from './constants'
import { validateSaudiPhone, validateRegistrationUrl, validateMapsUrl } from './utils'

export const programFormSchema = z
  .object({
    program_type: z.enum(PROGRAM_TYPES as [string, ...string[]]),
    title: z
      .string()
      .min(3, 'اسم الدورة يجب أن يكون 3 أحرف على الأقل')
      .max(200, 'اسم الدورة طويل جدًا')
      .refine((v) => !/<[^>]*>/.test(v), 'لا يُسمح بإدخال HTML'),
    organization_name: z
      .string()
      .min(2, 'اسم الجهة يجب أن يكون حرفين على الأقل')
      .max(200, 'اسم الجهة طويل جدًا')
      .refine((v) => !/<[^>]*>/.test(v), 'لا يُسمح بإدخال HTML'),
    organization_type: z.enum(ORGANIZATION_TYPES as [string, ...string[]]),
    description: z
      .string()
      .min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل')
      .max(5000, 'الوصف طويل جدًا')
      .refine((v) => !/<[^>]*>/.test(v), 'لا يُسمح بإدخال HTML'),
    region: z.string().min(1, 'المنطقة مطلوبة'),
    city: z.string().min(1, 'المدينة مطلوبة'),
    district: z.string().max(200).optional().nullable(),
    delivery_mode: z.enum(DELIVERY_MODES as [string, ...string[]]),
    maps_url: z
      .string()
      .optional()
      .nullable()
      .refine(
        (v) => !v || validateMapsUrl(v),
        'رابط الخريطة يجب أن يكون رابط Google Maps صحيحًا'
      ),
    gender: z.enum(GENDERS as [string, ...string[]]),
    age_groups: z
      .array(z.enum(AGE_GROUPS as [string, ...string[]]))
      .min(1, 'اختر فئة عمرية واحدة على الأقل'),
    branches: z
      .array(z.enum(BRANCHES as [string, ...string[]]))
      .min(1, 'اختر فرعًا واحدًا على الأقل'),
    custom_branch: z.string().max(200).optional().nullable(),
    instructor_name: z.string().max(200).optional().nullable(),
    phone: z
      .string()
      .optional()
      .nullable()
      .refine(
        (v) => !v || validateSaudiPhone(v),
        'رقم الجوال غير صحيح، يجب أن يكون رقمًا سعوديًا'
      ),
    show_phone: z.boolean().default(false),
    whatsapp_number: z
      .string()
      .optional()
      .nullable()
      .refine(
        (v) => !v || validateSaudiPhone(v),
        'رقم واتساب غير صحيح'
      ),
    registration_url: z
      .string()
      .min(1, 'رابط التسجيل مطلوب')
      .refine(validateRegistrationUrl, 'رابط التسجيل غير صحيح'),
    start_date: z.string().min(1, 'تاريخ البداية مطلوب'),
    end_date: z.string().min(1, 'تاريخ النهاية مطلوب'),
    registration_deadline: z.string().min(1, 'آخر موعد للتسجيل مطلوب'),
    schedule_days: z.array(z.string()).optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    fee_type: z.enum(FEE_TYPES as [string, ...string[]]),
    fee_amount: z.number().positive().optional().nullable(),
    agree_accuracy: z.literal(true, {
      errorMap: () => ({ message: 'يجب الإقرار بصحة المعلومات' }),
    }),
    agree_terms: z.literal(true, {
      errorMap: () => ({ message: 'يجب الموافقة على شروط الاستخدام' }),
    }),
    agree_privacy: z.literal(true, {
      errorMap: () => ({ message: 'يجب الموافقة على سياسة الخصوصية' }),
    }),
    agree_responsibility: z.literal(true, {
      errorMap: () => ({ message: 'يجب الإقرار بالمسؤولية' }),
    }),
    turnstile_token: z.string().optional().default(''),
  })
  .refine(
    (data) => {
      if (!data.end_date || !data.start_date) return true
      return new Date(data.end_date) >= new Date(data.start_date)
    },
    { message: 'تاريخ النهاية لا يمكن أن يسبق تاريخ البداية', path: ['end_date'] }
  )
  .refine(
    (data) => {
      if (!data.registration_deadline || !data.end_date) return true
      return new Date(data.registration_deadline) <= new Date(data.end_date)
    },
    {
      message: 'آخر موعد للتسجيل لا يمكن أن يتجاوز تاريخ نهاية الدورة',
      path: ['registration_deadline'],
    }
  )
  .refine(
    (data) => {
      const needsDistrict = data.delivery_mode === 'حضوري' || data.delivery_mode === 'هجين'
      if (needsDistrict && !data.district) return false
      return true
    },
    { message: 'الحي مطلوب للدورات الحضورية والهجينة', path: ['district'] }
  )
  .refine(
    (data) => {
      const needsMaps = data.delivery_mode === 'حضوري' || data.delivery_mode === 'هجين'
      if (needsMaps && !data.maps_url) return false
      return true
    },
    { message: 'رابط الخريطة مطلوب للدورات الحضورية والهجينة', path: ['maps_url'] }
  )
  .refine(
    (data) => {
      if (data.branches.includes('غير ذلك') && !data.custom_branch) return false
      return true
    },
    { message: 'يجب كتابة الفرع عند اختيار "غير ذلك"', path: ['custom_branch'] }
  )
  .refine(
    (data) => {
      if (data.fee_type === 'مدفوعة' && !data.fee_amount) return false
      return true
    },
    { message: 'يجب إدخال قيمة الرسوم للدورات المدفوعة', path: ['fee_amount'] }
  )

export const reportSchema = z.object({
  program_id: z.string().uuid(),
  reason: z.enum(REPORT_REASONS as [string, ...string[]]),
  details: z.string().max(1000).optional().nullable(),
  turnstile_token: z.string().min(1, 'يجب إكمال التحقق'),
})

export type ProgramFormData = z.infer<typeof programFormSchema>
export type ReportFormData = z.infer<typeof reportSchema>
