export type ProgramType =
  | 'دورة قرآنية'
  | 'حلقة قرآنية'
  | 'مقرأة'
  | 'برنامج إجازات'
  | 'دورة تجويد'
  | 'برنامج حفظ ومراجعة'
  | 'برنامج مكثف'
  | 'برنامج موسمي'
  | 'برنامج عن بُعد'

export type DeliveryMode = 'حضوري' | 'عن بُعد' | 'هجين'

export type Gender = 'رجال' | 'نساء' | 'رجال ونساء'

export type FeeType = 'مجانية' | 'مدفوعة'

export type ProgramStatus =
  | 'active'
  | 'registration_open'
  | 'registration_closed'
  | 'ended'
  | 'hidden'
  | 'soft_deleted'

export type OrganizationType =
  | 'جمعية'
  | 'مسجد'
  | 'مركز قرآني'
  | 'مؤسسة تعليمية'
  | 'فرد'
  | 'أخرى'

export type ReportReason =
  | 'معلومات غير صحيحة'
  | 'رابط لا يعمل'
  | 'دورة منتهية'
  | 'إعلان مكرر'
  | 'محتوى غير مناسب'
  | 'اشتباه في الاحتيال'
  | 'غير ذلك'

export type ReportStatus = 'جديد' | 'قيد المراجعة' | 'مغلق' | 'مرفوض'

export type AgeGroup =
  | 'أطفال'
  | 'ناشئة'
  | 'شباب'
  | 'بالغون'
  | 'كبار السن'
  | 'جميع الأعمار'

export type Branch =
  | 'جزء'
  | 'جزءان'
  | 'ثلاثة أجزاء'
  | 'خمسة أجزاء'
  | 'عشرة أجزاء'
  | 'خمسة عشر جزءًا'
  | 'عشرون جزءًا'
  | 'ثلاثون جزءًا (كامل القرآن)'
  | 'تصحيح تلاوة'
  | 'تجويد'
  | 'حفظ ومراجعة'
  | 'تعليم صغار'
  | 'إجازة قرآنية'
  | 'غير ذلك'

export interface Program {
  id: string
  slug: string
  program_type: ProgramType
  title: string
  description: string
  image_url: string | null
  organization_name: string
  organization_type: OrganizationType
  region: string
  city: string
  district: string | null
  delivery_mode: DeliveryMode
  gender: Gender
  age_groups: AgeGroup[]
  branches: Branch[]
  custom_branch: string | null
  instructor_name: string | null
  phone: string | null
  show_phone: boolean
  whatsapp_number: string | null
  registration_url: string
  maps_url: string | null
  start_date: string
  end_date: string
  registration_deadline: string
  schedule_days: string[] | null
  start_time: string | null
  end_time: string | null
  fee_type: FeeType
  fee_amount: number | null
  views_count: number
  status: ProgramStatus
  is_active: boolean
  hidden_reason: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  reports_count?: number
}

export interface ProgramReport {
  id: string
  program_id: string
  reason: ReportReason
  details: string | null
  status: ReportStatus
  created_at: string
  reviewed_at: string | null
  admin_notes: string | null
  program?: Pick<Program, 'id' | 'title' | 'slug'>
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  program_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export interface PlatformSetting {
  id: string
  key: string
  value: string
  description: string | null
  updated_at: string
}

export interface ProgramFilters {
  search?: string
  region?: string
  city?: string
  district?: string
  gender?: Gender
  branches?: Branch[]
  delivery_mode?: DeliveryMode
  fee_type?: FeeType
  registration_open?: boolean
  program_type?: ProgramType
  sort?: 'newest' | 'most_viewed' | 'deadline_soon'
  page?: number
  per_page?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface AdminStats {
  total: number
  active: number
  hidden: number
  ended: number
  soft_deleted: number
  added_today: number
  added_this_month: number
  total_views: number
  open_reports: number
  top_programs: Pick<Program, 'id' | 'title' | 'slug' | 'views_count'>[]
}
