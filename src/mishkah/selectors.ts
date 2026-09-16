import type {
  Employee,
  MeetingKind,
  PostKind,
  RequestStatus,
  RoleKey,
  ServiceCategory,
  TeamKind,
} from './types'

/** تسميات عربية موحّدة تُستخدم في كل الواجهات */

export const roleLabels: Record<RoleKey, string> = {
  guest: 'زائر',
  employee: 'موظف',
  unit_manager: 'مدير إدارة',
  team_lead: 'قائد فريق أو لجنة',
  service_owner: 'مسؤول خدمة',
  executive: 'الإدارة العليا',
  sysadmin: 'مدير النظام',
}

export const statusLabels: Record<RequestStatus, string> = {
  draft: 'مسودة',
  submitted: 'تم التقديم',
  review: 'تحت المراجعة',
  returned: 'معاد للاستكمال',
  approved: 'معتمد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  rejected: 'مرفوض',
}

/** لون كل حالة (يعتمد على متغيرات الهوية) */
export const statusTones: Record<RequestStatus, string> = {
  draft: '#6C7C78',
  submitted: '#2A6F97',
  review: '#B4782A',
  returned: '#B4782A',
  approved: '#2E7D58',
  in_progress: '#2A6F97',
  completed: '#0E4F4A',
  rejected: '#B23A34',
}

/** نسبة تقدم مبسطة لكل حالة */
export const statusProgress: Record<RequestStatus, number> = {
  draft: 5,
  submitted: 25,
  review: 45,
  returned: 35,
  approved: 65,
  in_progress: 80,
  completed: 100,
  rejected: 100,
}

export const postKindLabels: Record<PostKind, string> = {
  news: 'خبر',
  announcement: 'إعلان رسمي',
  congrats: 'تهنئة ومناسبة',
  poll: 'استطلاع',
  photos: 'صور فعالية',
  decision: 'قرار',
  knowledge: 'مشاركة معرفية',
}

export const meetingKindLabels: Record<MeetingKind, string> = {
  staff: 'لقاء موظفين',
  unit: 'اجتماع إدارة',
  workshop: 'ورشة عمل',
  scientific: 'فعالية علمية',
  team: 'اجتماع فريق أو لجنة',
  social: 'مناسبة داخلية',
  deadline: 'موعد نهائي',
}

export const meetingKindTones: Record<MeetingKind, string> = {
  staff: '#0E4F4A',
  unit: '#2A6F97',
  workshop: '#B98B3E',
  scientific: '#5B4B8A',
  team: '#2E7D58',
  social: '#C05E4C',
  deadline: '#B23A34',
}

export const teamKindLabels: Record<TeamKind, string> = {
  permanent: 'فريق دائم',
  committee: 'لجنة مؤقتة',
  project: 'فريق مشروع',
  interest: 'مجموعة اهتمام',
}

export const categoryLabels: Record<ServiceCategory, string> = {
  finance: 'الخدمات المالية',
  admin: 'الخدمات الإدارية',
  hr: 'الموارد البشرية',
  it: 'الدعم التقني',
  facilities: 'المرافق والصيانة',
  programs: 'البرامج والفعاليات',
  media: 'التصميم والإعلام',
  knowledge: 'المعرفة والوثائق',
}

/** هل يملك الموظف الدور المطلوب (مع اختياريّة نطاق محدد)؟ */
export function hasRole(employee: Employee | undefined, role: RoleKey, ref?: string): boolean {
  if (!employee) return false
  return employee.roles.some((r) => r.role === role && (!ref || r.ref === ref))
}

/** الأدوار التي يملكها الموظف مكتوبة بالعربية */
export function roleNames(employee: Employee): string[] {
  return Array.from(new Set(employee.roles.map((r) => roleLabels[r.role])))
}

/** هل يستطيع هذا الموظف اتخاذ إجراء على الطلبات (مدير إدارة أو مسؤول خدمة)؟ */
export function canApprove(employee: Employee | undefined): boolean {
  return hasRole(employee, 'unit_manager') || hasRole(employee, 'service_owner') || hasRole(employee, 'sysadmin')
}

/** تحويل الأرقام الإنجليزية إلى عربية للعرض فقط */
export function ar(value: string | number): string {
  return String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
}

/** يعرض قيمة حقل في النموذج بالصيغة العربية المناسبة لنوعه */
export function formatFieldValue(
  type: string,
  value: string,
  helpers: { date: (v: string) => string; time: (v: string) => string },
): string {
  if (!value) return value
  if (type === 'date') return helpers.date(value)
  if (type === 'time') return helpers.time(value)
  if (type === 'number') return ar(value)
  return value
}
