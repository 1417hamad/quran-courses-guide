/** أنواع البيانات لبيئة مشكاة الرقمية (نموذج تفاعلي ببيانات تجريبية) */

export type RoleKey =
  | 'guest'
  | 'employee'
  | 'unit_manager'
  | 'team_lead'
  | 'service_owner'
  | 'executive'
  | 'sysadmin'

export type ScopeKind = 'center' | 'unit' | 'team' | 'service' | 'people'

export interface RoleAssignment {
  role: RoleKey
  scope: ScopeKind
  /** معرّف الإدارة أو الفريق أو الخدمة التي ينطبق عليها الدور */
  ref?: string
}

export interface Employee {
  id: string
  name: string
  title: string
  unitId: string
  teamIds: string[]
  initials: string
  tone: string
  bio: string
  expertise: string[]
  email: string
  phone: string
  extension?: string
  workDays: string[]
  workHours: string
  joinedAt: string
  roles: RoleAssignment[]
  isNew?: boolean
}

export interface UnitTrack {
  id: string
  name: string
  note?: string
}

export interface Unit {
  id: string
  name: string
  managerId: string
  about: string
  tracks?: UnitTrack[]
  serviceIds: string[]
  kpis?: { label: string; value: string; hint?: string }[]
}

export type TeamKind = 'permanent' | 'committee' | 'project' | 'interest'

export interface Team {
  id: string
  name: string
  kind: TeamKind
  unitId?: string
  leadId: string
  memberIds: string[]
  about: string
  startDate: string
  endDate?: string
  status: 'active' | 'archived'
  links?: { label: string; href: string }[]
}

export type ServiceCategory =
  | 'finance'
  | 'admin'
  | 'hr'
  | 'it'
  | 'facilities'
  | 'programs'
  | 'media'
  | 'knowledge'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'time'
  | 'select'
  | 'number'
  | 'file'
  | 'checkbox'
  | 'readonly'

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
  required?: boolean
  hint?: string
  placeholder?: string
  /** يظهر الحقل فقط عندما تساوي قيمة حقل آخر إحدى القيم المذكورة */
  showIf?: { key: string; equals: string[] }
  /** ترتيب الحقل ضمن خطوات النموذج */
  step?: number
}

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  description: string
  ownerUnitId: string
  ownerId: string
  slaDays: number
  eligibility: string
  requirements: string[]
  approvalChain: string[]
  form: FieldDef[]
  popular?: boolean
  usageCount: number
}

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'returned'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'rejected'

export interface RequestEvent {
  at: string
  actorId: string
  action: string
  note?: string
}

export interface RequestAttachment {
  name: string
  size: string
}

export interface ServiceRequest {
  id: string
  ref: string
  serviceId: string
  requesterId: string
  createdAt: string
  updatedAt: string
  status: RequestStatus
  currentOwnerId: string
  dueDays: number
  values: Record<string, string>
  attachments: RequestAttachment[]
  timeline: RequestEvent[]
  /** عدد الأيام المتبقية للمدة المستهدفة (سالب يعني متأخر) */
  daysLeft: number
}

export type AudienceKind = 'center' | 'unit' | 'team' | 'people'

export interface Audience {
  kind: AudienceKind
  ref?: string
  label: string
}

export type PostKind =
  | 'news'
  | 'announcement'
  | 'congrats'
  | 'poll'
  | 'photos'
  | 'decision'
  | 'knowledge'

export interface PollOption {
  id: string
  label: string
  votes: number
}

export interface Comment {
  id: string
  authorId: string
  at: string
  body: string
}

export interface Post {
  id: string
  authorId: string
  createdAt: string
  kind: PostKind
  body: string
  audience: Audience
  mentions?: string[]
  images?: { caption: string; tone: string }[]
  attachment?: { name: string; size: string }
  poll?: { question: string; options: PollOption[]; myVote?: string; closesAt: string }
  reactions: Record<string, number>
  myReaction?: string
  comments: Comment[]
  saved: boolean
  decisionId?: string
  pinned?: boolean
}

export type MeetingKind =
  | 'staff'
  | 'unit'
  | 'workshop'
  | 'scientific'
  | 'team'
  | 'social'
  | 'deadline'

export type Rsvp = 'yes' | 'no' | 'none'

export interface Meeting {
  id: string
  title: string
  kind: MeetingKind
  date: string
  start: string
  end: string
  location: string
  onlineLink?: string
  organizerId: string
  inviteeIds: string[]
  unitId?: string
  teamId?: string
  description: string
  attachments: { name: string; size: string }[]
  myRsvp: Rsvp
  attendance: { yes: number; no: number; pending: number }
  minutes?: string
}

export type DocType =
  | 'decision'
  | 'circular'
  | 'policy'
  | 'regulation'
  | 'guide'
  | 'form'
  | 'minutes'
  | 'report'
  | 'intro'
  | 'link'
  | 'faq'

export interface DocVersion {
  version: string
  at: string
  note: string
}

export interface KnowledgeDoc {
  id: string
  title: string
  type: DocType
  ownerUnitId: string
  issuedBy: string
  issuedAt: string
  effectiveAt?: string
  version: string
  audience: string[]
  summary: string
  body?: string
  fileName?: string
  href?: string
  requiresAck?: boolean
  ackByIds: string[]
  previousVersions: DocVersion[]
  favorite: boolean
  views: number
  visibility: 'all' | 'managers' | 'unit'
}

export type NotificationKind =
  | 'action'
  | 'decision'
  | 'mention'
  | 'meeting'
  | 'request'
  | 'announcement'
  | 'celebration'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  at: string
  read: boolean
  importance: 'high' | 'normal' | 'low'
  href: string
}

export interface PlatformLink {
  id: string
  label: string
  description: string
  href: string
  tone: string
}

export interface Toast {
  id: string
  message: string
  tone: 'success' | 'info' | 'warn' | 'danger'
}
