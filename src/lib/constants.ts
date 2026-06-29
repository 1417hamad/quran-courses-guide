import type {
  ProgramType,
  DeliveryMode,
  Gender,
  FeeType,
  OrganizationType,
  ReportReason,
  AgeGroup,
  Branch,
  ProgramStatus,
} from '@/types'

export const PROGRAM_TYPES: ProgramType[] = [
  'دورة قرآنية',
  'حلقة قرآنية',
  'مقرأة',
  'برنامج إجازات',
  'دورة تجويد',
  'برنامج حفظ ومراجعة',
  'برنامج مكثف',
  'برنامج موسمي',
  'برنامج عن بُعد',
]

export const DEFAULT_PROGRAM_TYPE: ProgramType = 'دورة قرآنية'

export const DELIVERY_MODES: DeliveryMode[] = ['حضوري', 'عن بُعد', 'هجين']

export const GENDERS: Gender[] = ['رجال', 'نساء', 'رجال ونساء']

export const FEE_TYPES: FeeType[] = ['مجانية', 'مدفوعة']

export const ORGANIZATION_TYPES: OrganizationType[] = [
  'جمعية',
  'مسجد',
  'مركز قرآني',
  'مؤسسة تعليمية',
  'فرد',
  'أخرى',
]

export const REPORT_REASONS: ReportReason[] = [
  'معلومات غير صحيحة',
  'رابط لا يعمل',
  'دورة منتهية',
  'إعلان مكرر',
  'محتوى غير مناسب',
  'اشتباه في الاحتيال',
  'غير ذلك',
]

export const AGE_GROUPS: AgeGroup[] = [
  'أطفال',
  'ناشئة',
  'شباب',
  'بالغون',
  'كبار السن',
  'جميع الأعمار',
]

export const BRANCHES: Branch[] = [
  'جزء',
  'جزءان',
  'ثلاثة أجزاء',
  'خمسة أجزاء',
  'عشرة أجزاء',
  'خمسة عشر جزءًا',
  'عشرون جزءًا',
  'ثلاثون جزءًا (كامل القرآن)',
  'تصحيح تلاوة',
  'تجويد',
  'حفظ ومراجعة',
  'تعليم صغار',
  'إجازة قرآنية',
  'غير ذلك',
]

export const SCHEDULE_DAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
]

export const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
  active: 'نشط',
  registration_open: 'التسجيل متاح',
  registration_closed: 'التسجيل مغلق',
  ended: 'منتهٍ',
  hidden: 'مخفي',
  soft_deleted: 'محذوف مؤقتًا',
}

export const PROGRAM_STATUS_COLORS: Record<ProgramStatus, string> = {
  active: 'bg-green-100 text-green-800',
  registration_open: 'bg-blue-100 text-blue-800',
  registration_closed: 'bg-yellow-100 text-yellow-800',
  ended: 'bg-gray-100 text-gray-800',
  hidden: 'bg-orange-100 text-orange-800',
  soft_deleted: 'bg-red-100 text-red-800',
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const ITEMS_PER_PAGE = 12
export const ADMIN_ITEMS_PER_PAGE = 20

export const RATE_LIMIT_PROGRAM_WINDOW = 60 * 60 * 1000 // 1 hour
export const RATE_LIMIT_PROGRAM_MAX = 3 // 3 programs per hour per IP

export const RATE_LIMIT_REPORT_WINDOW = 60 * 60 * 1000 // 1 hour
export const RATE_LIMIT_REPORT_MAX = 5 // 5 reports per hour per IP

export const VIEW_COOLDOWN = 24 * 60 * 60 * 1000 // 24 hours
