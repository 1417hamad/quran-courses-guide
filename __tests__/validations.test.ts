import { describe, it, expect } from 'vitest'
import { validateSaudiPhone, validateRegistrationUrl, validateMapsUrl, sanitizeText } from '../src/lib/utils'
import { getCitiesByRegion } from '../src/lib/regions'
import { programFormSchema } from '../src/lib/validations'

describe('validateSaudiPhone', () => {
  it('يقبل رقمًا سعوديًا صحيحًا', () => {
    expect(validateSaudiPhone('0512345678')).toBe(true)
    expect(validateSaudiPhone('05 1234 5678')).toBe(true)
    expect(validateSaudiPhone('+966512345678')).toBe(true)
    expect(validateSaudiPhone('00966512345678')).toBe(true)
  })

  it('يرفض أرقامًا غير صحيحة', () => {
    expect(validateSaudiPhone('1234567890')).toBe(false)
    expect(validateSaudiPhone('051234')).toBe(false)
    expect(validateSaudiPhone('abc')).toBe(false)
  })
})

describe('validateRegistrationUrl', () => {
  it('يقبل روابط https صحيحة', () => {
    expect(validateRegistrationUrl('https://example.com/register')).toBe(true)
    expect(validateRegistrationUrl('http://example.com')).toBe(true)
  })

  it('يرفض روابط غير صحيحة', () => {
    expect(validateRegistrationUrl('not-a-url')).toBe(false)
    expect(validateRegistrationUrl('ftp://file.com')).toBe(false)
  })
})

describe('validateMapsUrl', () => {
  it('يقبل روابط خرائط Google', () => {
    expect(validateMapsUrl('https://maps.google.com/?q=24.7,46.7')).toBe(true)
    expect(validateMapsUrl('https://goo.gl/maps/abc')).toBe(true)
  })

  it('يرفض روابط غير خرائط', () => {
    expect(validateMapsUrl('https://example.com')).toBe(false)
  })
})

describe('sanitizeText', () => {
  it('يزيل HTML من النص', () => {
    expect(sanitizeText('<script>alert("xss")</script>Hello')).not.toContain('<script>')
    expect(sanitizeText('<b>Bold</b>')).not.toContain('<b>')
  })

  it('يحتفظ بالنص العربي العادي', () => {
    const text = 'دورة تحفيظ القرآن الكريم'
    expect(sanitizeText(text)).toBe(text)
  })
})

describe('getCitiesByRegion', () => {
  it('يُرجع مدن المنطقة الصحيحة', () => {
    const cities = getCitiesByRegion('منطقة الرياض')
    expect(cities).toContain('الرياض')
    expect(cities).toContain('الخرج')
    expect(cities.length).toBeGreaterThan(5)
  })

  it('يُرجع مصفوفة فارغة لمنطقة غير موجودة', () => {
    expect(getCitiesByRegion('منطقة غير موجودة')).toEqual([])
  })
})

describe('programFormSchema', () => {
  const validData = {
    program_type: 'دورة قرآنية',
    title: 'دورة تحفيظ القرآن',
    organization_name: 'جمعية تحفيظ',
    organization_type: 'جمعية',
    description: 'وصف تفصيلي للدورة القرآنية يشمل أهدافها ومحتواها',
    region: 'منطقة الرياض',
    city: 'الرياض',
    district: 'العليا',
    delivery_mode: 'حضوري',
    gender: 'رجال',
    age_groups: ['شباب'],
    branches: ['ثلاثون جزءًا (كامل القرآن)'],
    registration_url: 'https://example.com/register',
    maps_url: 'https://maps.google.com/?q=24.7,46.7',
    start_date: '2025-08-01',
    end_date: '2025-10-31',
    registration_deadline: '2025-07-25',
    fee_type: 'مجانية',
    agree_accuracy: true as const,
    agree_terms: true as const,
    agree_privacy: true as const,
    agree_responsibility: true as const,
    turnstile_token: 'test-token',
    show_phone: false,
  }

  it('يقبل بيانات صحيحة', () => {
    const result = programFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('يرفض عند عدم وجود عنوان', () => {
    const result = programFormSchema.safeParse({ ...validData, title: '' })
    expect(result.success).toBe(false)
  })

  it('يرفض تاريخ نهاية قبل تاريخ البداية', () => {
    const result = programFormSchema.safeParse({
      ...validData,
      start_date: '2025-10-01',
      end_date: '2025-08-01',
      registration_deadline: '2025-07-01',
    })
    expect(result.success).toBe(false)
  })

  it('يرفض الدورات الحضورية بدون حي', () => {
    const result = programFormSchema.safeParse({ ...validData, district: '' })
    expect(result.success).toBe(false)
  })

  it('يتطلب قيمة الرسوم للدورات المدفوعة', () => {
    const result = programFormSchema.safeParse({
      ...validData,
      fee_type: 'مدفوعة',
      fee_amount: undefined,
    })
    expect(result.success).toBe(false)
  })
})
