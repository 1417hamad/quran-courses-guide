'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { hydrationStore, rememberDevice, rememberedUser } from './remember'
import {
  employees as seedEmployees,
  units as seedUnits,
  teams as seedTeams,
  services as seedServices,
  requests as seedRequests,
  posts as seedPosts,
  meetings as seedMeetings,
  documents as seedDocs,
  notifications as seedNotifications,
} from './data'
import type {
  AppNotification,
  Employee,
  KnowledgeDoc,
  Meeting,
  Post,
  RequestStatus,
  Rsvp,
  Service,
  ServiceRequest,
  Team,
  Toast,
  Unit,
  RoleKey,
} from './types'

/** خطوات الدخول التجريبي */
export type AuthStep = 'identity' | 'otp' | 'authenticated'

/** رمز التحقق التجريبي — يُعرض للمستخدم داخل الشاشة */
export const DEMO_OTP = '1234'

interface MishkahState {
  authStep: AuthStep
  identifier: string
  /** المستخدم الذي اختاره الزائر صراحة؛ null يعني «استخدم الجلسة المحفوظة أو الافتراضي» */
  pickedUserId: string | null
  employees: Employee[]
  units: Unit[]
  teams: Team[]
  services: Service[]
  requests: ServiceRequest[]
  posts: Post[]
  meetings: Meeting[]
  documents: KnowledgeDoc[]
  notifications: AppNotification[]
  toasts: Toast[]
}

interface MishkahActions {
  startLogin: (identifier: string, remember: boolean) => void
  verifyOtp: (code: string) => boolean
  logout: () => void
  switchUser: (id: string) => void

  toast: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: string) => void

  addPost: (input: {
    body: string
    kind: Post['kind']
    audience: Post['audience']
    mentions?: string[]
    attachment?: { name: string; size: string }
    poll?: { question: string; options: string[] }
  }) => void
  react: (postId: string, emoji: string) => void
  comment: (postId: string, body: string) => void
  vote: (postId: string, optionId: string) => void
  toggleSavePost: (postId: string) => void

  rsvp: (meetingId: string, answer: Rsvp) => void

  acknowledgeDoc: (docId: string) => void
  toggleFavoriteDoc: (docId: string) => void

  submitRequest: (
    serviceId: string,
    values: Record<string, string>,
    attachments: { name: string; size: string }[],
    asDraft?: boolean,
  ) => ServiceRequest
  actOnRequest: (
    requestId: string,
    action: 'approve' | 'reject' | 'return' | 'forward' | 'note' | 'progress' | 'close',
    note?: string,
    forwardTo?: string,
  ) => void

  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  addUnit: (input: { name: string; managerId: string; about: string }) => void
  addTeam: (input: { name: string; kind: Team['kind']; leadId: string; unitId?: string; about: string }) => void
  addEmployee: (input: { name: string; title: string; unitId: string }) => void
  grantRole: (employeeId: string, role: RoleKey, scope: string) => void
  addService: (input: {
    name: string
    category: Service['category']
    description: string
    ownerUnitId: string
    ownerId: string
    slaDays: number
    approvalChain: string[]
  }) => void
  publishAnnouncement: (body: string) => void
  resetDemo: () => void
}

type MishkahContextValue = MishkahState &
  MishkahActions & {
    /** true بعد أن يعمل المتصفح ويُعرف ما إذا كانت هناك جلسة محفوظة */
    hydrated: boolean
    /** مرحلة الدخول بعد أخذ الجلسة المحفوظة في الحسبان */
    authStep: AuthStep
    /** المستخدم الفعّال الآن (الاختيار الصريح، أو الجلسة المحفوظة، أو الافتراضي) */
    currentUserId: string
    currentUser: Employee
    isAuthenticated: boolean
  }

const MishkahContext = createContext<MishkahContextValue | null>(null)

/** الحالة الابتدائية مأخوذة من البيانات التجريبية */
function initialState(): MishkahState {
  return {
    authStep: 'identity',
    identifier: '',
    pickedUserId: null,
    employees: structuredClone(seedEmployees),
    units: structuredClone(seedUnits),
    teams: structuredClone(seedTeams),
    services: structuredClone(seedServices),
    requests: structuredClone(seedRequests),
    posts: structuredClone(seedPosts),
    meetings: structuredClone(seedMeetings),
    documents: structuredClone(seedDocs),
    notifications: structuredClone(seedNotifications),
    toasts: [],
  }
}

let counter = 0
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++counter}`

export function MishkahProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MishkahState>(initialState)

  /** الجلسة المحفوظة ومرحلة التحميل تُقرآن من مخزن خارجي بدل setState داخل useEffect */
  const remembered = useSyncExternalStore(
    rememberedUser.subscribe,
    rememberedUser.getSnapshot,
    rememberedUser.getServerSnapshot,
  )
  const hydrated = useSyncExternalStore(
    hydrationStore.subscribe,
    hydrationStore.getSnapshot,
    hydrationStore.getServerSnapshot,
  )

  const currentUserId = state.pickedUserId ?? remembered ?? 'emp-01'
  const authStep: AuthStep = remembered ? 'authenticated' : state.authStep

  const patch = useCallback((fn: (s: MishkahState) => MishkahState) => setState(fn), [])

  const toast = useCallback<MishkahActions['toast']>((message, tone = 'success') => {
    const id = uid('toast')
    setState((s) => ({ ...s, toasts: [...s.toasts, { id, message, tone }] }))
    setTimeout(() => setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) })), 3600)
  }, [])

  const dismissToast = useCallback<MishkahActions['dismissToast']>((id) => {
    setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }))
  }, [])

  const startLogin = useCallback<MishkahActions['startLogin']>((identifier, remember) => {
    rememberDevice.set(remember)
    setState((s) => ({ ...s, identifier, authStep: 'otp' }))
  }, [])

  const verifyOtp = useCallback<MishkahActions['verifyOtp']>(
    (code) => {
      if (code.replace(/\s/g, '') !== DEMO_OTP) return false
      if (rememberDevice.get()) rememberedUser.set(currentUserId)
      setState((s) => ({ ...s, authStep: 'authenticated' }))
      return true
    },
    [currentUserId],
  )

  const logout = useCallback<MishkahActions['logout']>(() => {
    rememberedUser.set(null)
    setState((s) => ({ ...s, authStep: 'identity', identifier: '' }))
  }, [])

  const switchUser = useCallback<MishkahActions['switchUser']>(
    (id) => {
      if (remembered) rememberedUser.set(id)
      setState((s) => ({ ...s, pickedUserId: id }))
    },
    [remembered],
  )

  // ——————————————————————— الحائط التفاعلي ———————————————————————

  const addPost = useCallback<MishkahActions['addPost']>(
    (input) => {
      patch((s) => ({
        ...s,
        posts: [
          {
            id: uid('post'),
            authorId: currentUserId,
            createdAt: new Date().toISOString(),
            kind: input.kind,
            body: input.body,
            audience: input.audience,
            mentions: input.mentions,
            attachment: input.attachment,
            poll: input.poll
              ? {
                  question: input.poll.question,
                  options: input.poll.options.map((label, i) => ({ id: `o-${i}`, label, votes: 0 })),
                  closesAt: '',
                }
              : undefined,
            reactions: {},
            comments: [],
            saved: false,
          },
          ...s.posts,
        ],
      }))
      toast('تم نشر المشاركة على الحائط')
    },
    [patch, toast, currentUserId],
  )

  const react = useCallback<MishkahActions['react']>(
    (postId, emoji) => {
      patch((s) => ({
        ...s,
        posts: s.posts.map((p) => {
          if (p.id !== postId) return p
          const reactions = { ...p.reactions }
          if (p.myReaction === emoji) {
            reactions[emoji] = Math.max(0, (reactions[emoji] ?? 1) - 1)
            if (reactions[emoji] === 0) delete reactions[emoji]
            return { ...p, reactions, myReaction: undefined }
          }
          if (p.myReaction) {
            reactions[p.myReaction] = Math.max(0, (reactions[p.myReaction] ?? 1) - 1)
            if (reactions[p.myReaction] === 0) delete reactions[p.myReaction]
          }
          reactions[emoji] = (reactions[emoji] ?? 0) + 1
          return { ...p, reactions, myReaction: emoji }
        }),
      }))
    },
    [patch],
  )

  const comment = useCallback<MishkahActions['comment']>(
    (postId, body) => {
      patch((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  { id: uid('c'), authorId: currentUserId, at: new Date().toISOString(), body },
                ],
              }
            : p,
        ),
      }))
      toast('تمت إضافة تعليقك')
    },
    [patch, toast, currentUserId],
  )

  const vote = useCallback<MishkahActions['vote']>(
    (postId, optionId) => {
      patch((s) => ({
        ...s,
        posts: s.posts.map((p) => {
          if (p.id !== postId || !p.poll) return p
          if (p.poll.myVote === optionId) return p
          const options = p.poll.options.map((o) => {
            let votes = o.votes
            if (o.id === p.poll?.myVote) votes -= 1
            if (o.id === optionId) votes += 1
            return { ...o, votes }
          })
          return { ...p, poll: { ...p.poll, options, myVote: optionId } }
        }),
      }))
      toast('تم تسجيل مشاركتك في الاستطلاع')
    },
    [patch, toast],
  )

  const toggleSavePost = useCallback<MishkahActions['toggleSavePost']>(
    (postId) => {
      let nowSaved = false
      patch((s) => ({
        ...s,
        posts: s.posts.map((p) => {
          if (p.id !== postId) return p
          nowSaved = !p.saved
          return { ...p, saved: nowSaved }
        }),
      }))
      toast(nowSaved ? 'تم حفظ المنشور' : 'أُزيل من المحفوظات', 'info')
    },
    [patch, toast],
  )

  // ——————————————————————— اللقاءات ———————————————————————

  const rsvp = useCallback<MishkahActions['rsvp']>(
    (meetingId, answer) => {
      patch((s) => ({
        ...s,
        meetings: s.meetings.map((m) => {
          if (m.id !== meetingId) return m
          const attendance = { ...m.attendance }
          if (m.myRsvp === 'yes') attendance.yes = Math.max(0, attendance.yes - 1)
          if (m.myRsvp === 'no') attendance.no = Math.max(0, attendance.no - 1)
          if (m.myRsvp === 'none') attendance.pending = Math.max(0, attendance.pending - 1)
          if (answer === 'yes') attendance.yes += 1
          if (answer === 'no') attendance.no += 1
          if (answer === 'none') attendance.pending += 1
          return { ...m, myRsvp: answer, attendance }
        }),
      }))
      toast(answer === 'yes' ? 'تم تأكيد حضورك' : answer === 'no' ? 'تم تسجيل اعتذارك' : 'تم إلغاء ردّك', answer === 'no' ? 'info' : 'success')
    },
    [patch, toast],
  )

  // ——————————————————————— المعرفة والقرارات ———————————————————————

  const acknowledgeDoc = useCallback<MishkahActions['acknowledgeDoc']>(
    (docId) => {
      patch((s) => ({
        ...s,
        documents: s.documents.map((d) =>
          d.id === docId && !d.ackByIds.includes(currentUserId)
            ? { ...d, ackByIds: [...d.ackByIds, currentUserId] }
            : d,
        ),
      }))
      toast('تم تسجيل اطلاعك على القرار')
    },
    [patch, toast, currentUserId],
  )

  const toggleFavoriteDoc = useCallback<MishkahActions['toggleFavoriteDoc']>(
    (docId) => {
      patch((s) => ({
        ...s,
        documents: s.documents.map((d) => (d.id === docId ? { ...d, favorite: !d.favorite } : d)),
      }))
    },
    [patch],
  )

  // ——————————————————————— الطلبات ———————————————————————

  const submitRequest = useCallback<MishkahActions['submitRequest']>(
    (serviceId, values, attachments, asDraft = false) => {
      const service = seedServices.find((s) => s.id === serviceId)!
      const now = new Date().toISOString()
      const seq = 1046 + counter
      const created: ServiceRequest = {
        id: uid('req'),
        ref: asDraft ? `مسودة-${seq}` : `طلب-${seq}`,
        serviceId,
        requesterId: currentUserId,
        createdAt: now,
        updatedAt: now,
        status: asDraft ? 'draft' : 'submitted',
        currentOwnerId: asDraft ? currentUserId : service.ownerId,
        dueDays: service.slaDays,
        daysLeft: service.slaDays,
        values,
        attachments,
        timeline: [
          {
            at: now,
            actorId: currentUserId,
            action: asDraft ? 'حفظ كمسودة' : 'تم تقديم الطلب',
          },
        ],
      }
      patch((s) => ({
        ...s,
        requests: [created, ...s.requests],
        notifications: asDraft
          ? s.notifications
          : [
              {
                id: uid('ntf'),
                kind: 'request',
                title: 'تم استلام طلبك',
                body: `${service.name} — ${created.ref} قيد المعالجة لدى ${'الجهة المسؤولة'}.`,
                at: now,
                read: false,
                importance: 'normal',
                href: `/mishkah/office/requests/${created.id}`,
              },
              ...s.notifications,
            ],
      }))
      toast(asDraft ? 'تم حفظ الطلب كمسودة' : `تم إرسال الطلب برقم ${created.ref}`)
      return created
    },
    [patch, currentUserId, toast],
  )

  const actOnRequest = useCallback<MishkahActions['actOnRequest']>(
    (requestId, action, note, forwardTo) => {
      const labels: Record<string, { label: string; status?: RequestStatus; tone: Toast['tone'] }> = {
        approve: { label: 'اعتماد الطلب', status: 'approved', tone: 'success' },
        reject: { label: 'رفض الطلب', status: 'rejected', tone: 'danger' },
        return: { label: 'إعادة للاستكمال', status: 'returned', tone: 'warn' },
        forward: { label: 'تحويل الطلب', tone: 'info' },
        note: { label: 'إضافة ملاحظة', tone: 'info' },
        progress: { label: 'بدء التنفيذ', status: 'in_progress', tone: 'info' },
        close: { label: 'إغلاق الطلب', status: 'completed', tone: 'success' },
      }
      const meta = labels[action]
      patch((s) => ({
        ...s,
        requests: s.requests.map((r) => {
          if (r.id !== requestId) return r
          const now = new Date().toISOString()
          return {
            ...r,
            status: meta.status ?? r.status,
            updatedAt: now,
            currentOwnerId:
              action === 'forward' && forwardTo
                ? forwardTo
                : action === 'return'
                  ? r.requesterId
                  : r.currentOwnerId,
            timeline: [...r.timeline, { at: now, actorId: currentUserId, action: meta.label, note }],
          }
        }),
      }))
      toast(`${meta.label} بنجاح`, meta.tone)
    },
    [patch, toast, currentUserId],
  )

  // ——————————————————————— الإشعارات ———————————————————————

  const markNotificationRead = useCallback<MishkahActions['markNotificationRead']>(
    (id) => {
      patch((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }))
    },
    [patch],
  )

  const markAllNotificationsRead = useCallback<MishkahActions['markAllNotificationsRead']>(() => {
    patch((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }))
    toast('تم تعليم جميع الإشعارات كمقروءة', 'info')
  }, [patch, toast])

  // ——————————————————————— لوحة مدير النظام ———————————————————————

  const addUnit = useCallback<MishkahActions['addUnit']>(
    (input) => {
      patch((s) => ({
        ...s,
        units: [
          ...s.units,
          { id: uid('unit'), name: input.name, managerId: input.managerId, about: input.about, serviceIds: [] },
        ],
      }))
      toast(`تمت إضافة «${input.name}» إلى إدارات المركز`)
    },
    [patch, toast],
  )

  const addTeam = useCallback<MishkahActions['addTeam']>(
    (input) => {
      const today = new Date().toISOString().slice(0, 10)
      patch((s) => ({
        ...s,
        teams: [
          ...s.teams,
          {
            id: uid('team'),
            name: input.name,
            kind: input.kind,
            unitId: input.unitId,
            leadId: input.leadId,
            memberIds: [input.leadId],
            about: input.about,
            startDate: today,
            status: 'active',
          },
        ],
      }))
      toast(`تم إنشاء «${input.name}»`)
    },
    [patch, toast],
  )

  const addEmployee = useCallback<MishkahActions['addEmployee']>(
    (input) => {
      const parts = input.name.trim().split(/\s+/)
      const initials = `${parts[0]?.[0] ?? 'م'} ${parts[parts.length - 1]?.[0] ?? 'م'}`
      patch((s) => ({
        ...s,
        employees: [
          ...s.employees,
          {
            id: uid('emp'),
            name: input.name,
            title: input.title,
            unitId: input.unitId,
            teamIds: [],
            initials,
            tone: '#0E4F4A',
            bio: 'موظف جديد في المركز.',
            expertise: [],
            email: 'new.member@mishkah.sa',
            phone: '05xxxxxxxx',
            workDays: ['الأحد', 'الثلاثاء'],
            workHours: '٩ صباحًا – ٢ ظهرًا',
            joinedAt: new Date().toISOString().slice(0, 10),
            roles: [{ role: 'employee', scope: 'unit', ref: input.unitId }],
            isNew: true,
          },
        ],
      }))
      toast(`تمت إضافة ${input.name} إلى دليل الموظفين`)
    },
    [patch, toast],
  )

  const grantRole = useCallback<MishkahActions['grantRole']>(
    (employeeId, role, scopeRef) => {
      patch((s) => ({
        ...s,
        employees: s.employees.map((e) =>
          e.id === employeeId
            ? {
                ...e,
                roles: [
                  ...e.roles,
                  {
                    role,
                    scope: role === 'sysadmin' || role === 'executive' ? 'center' : role === 'team_lead' ? 'team' : role === 'service_owner' ? 'service' : 'unit',
                    ref: scopeRef || undefined,
                  },
                ],
              }
            : e,
        ),
        units: s.units.map((u) => (role === 'unit_manager' && u.id === scopeRef ? { ...u, managerId: employeeId } : u)),
      }))
      toast('تم منح الصلاحية بنجاح')
    },
    [patch, toast],
  )

  const addService = useCallback<MishkahActions['addService']>(
    (input) => {
      const id = uid('svc')
      patch((s) => ({
        ...s,
        services: [
          ...s.services,
          {
            id,
            name: input.name,
            category: input.category,
            description: input.description,
            ownerUnitId: input.ownerUnitId,
            ownerId: input.ownerId,
            slaDays: input.slaDays,
            eligibility: 'جميع موظفي المركز',
            requirements: ['تفاصيل الطلب'],
            approvalChain: input.approvalChain,
            usageCount: 0,
            form: [
              { key: 'subject', label: 'موضوع الطلب', type: 'text', required: true, step: 1 },
              { key: 'details', label: 'تفاصيل الطلب', type: 'textarea', required: true, step: 1 },
              { key: 'neededAt', label: 'التاريخ المطلوب', type: 'date', step: 2 },
              { key: 'attachment', label: 'المرفقات', type: 'file', step: 2 },
            ],
          },
        ],
        units: s.units.map((u) =>
          u.id === input.ownerUnitId ? { ...u, serviceIds: [...u.serviceIds, id] } : u,
        ),
      }))
      toast(`تمت إضافة خدمة «${input.name}» إلى الدليل`)
    },
    [patch, toast],
  )

  const publishAnnouncement = useCallback<MishkahActions['publishAnnouncement']>(
    (body) => {
      patch((s) => ({
        ...s,
        posts: [
          {
            id: uid('post'),
            authorId: currentUserId,
            createdAt: new Date().toISOString(),
            kind: 'announcement',
            body,
            audience: { kind: 'center', label: 'لجميع موظفي المركز' },
            reactions: {},
            comments: [],
            saved: false,
            pinned: true,
          },
          ...s.posts,
        ],
      }))
      toast('تم نشر الإعلان الرسمي على الصفحة الرئيسة')
    },
    [patch, toast, currentUserId],
  )

  const resetDemo = useCallback<MishkahActions['resetDemo']>(() => {
    setState((s) => ({ ...initialState(), authStep: s.authStep, pickedUserId: s.pickedUserId }))
    toast('تمت إعادة البيانات التجريبية إلى حالتها الأولى', 'info')
  }, [toast])

  const currentUser = useMemo(
    () => state.employees.find((e) => e.id === currentUserId) ?? state.employees[0],
    [state.employees, currentUserId],
  )

  const value = useMemo<MishkahContextValue>(
    () => ({
      ...state,
      hydrated,
      authStep,
      currentUserId,
      currentUser,
      isAuthenticated: authStep === 'authenticated',
      startLogin,
      verifyOtp,
      logout,
      switchUser,
      toast,
      dismissToast,
      addPost,
      react,
      comment,
      vote,
      toggleSavePost,
      rsvp,
      acknowledgeDoc,
      toggleFavoriteDoc,
      submitRequest,
      actOnRequest,
      markNotificationRead,
      markAllNotificationsRead,
      addUnit,
      addTeam,
      addEmployee,
      grantRole,
      addService,
      publishAnnouncement,
      resetDemo,
    }),
    [
      state, hydrated, authStep, currentUserId, currentUser,
      startLogin, verifyOtp, logout, switchUser, toast, dismissToast,
      addPost, react, comment, vote, toggleSavePost, rsvp, acknowledgeDoc, toggleFavoriteDoc,
      submitRequest, actOnRequest, markNotificationRead, markAllNotificationsRead, addUnit,
      addTeam, addEmployee, grantRole, addService, publishAnnouncement, resetDemo,
    ],
  )

  return <MishkahContext.Provider value={value}>{children}</MishkahContext.Provider>
}

export function useMishkah(): MishkahContextValue {
  const ctx = useContext(MishkahContext)
  if (!ctx) throw new Error('useMishkah يجب أن يُستخدم داخل MishkahProvider')
  return ctx
}
