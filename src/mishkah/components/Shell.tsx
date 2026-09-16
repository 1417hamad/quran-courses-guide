'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Briefcase,
  LayoutGrid,
  Users,
  BookOpen,
  Bell,
  Search,
  Calendar,
  Shield,
  BarChart3,
  LogOut,
  UserCircle2,
  RefreshCw,
  ChevronDown,
  Contact,
} from 'lucide-react'
import { brand, brandCssVars } from '../brand'
import { useMishkah } from '../store'
import { demoPersonas } from '../data'
import { Avatar, Logo, ToastHost, Modal } from '../ui'
import { roleNames, ar } from '../selectors'
import { LoginScreen } from './LoginScreen'
import { GlobalSearch } from './GlobalSearch'

/** الأقسام الخمسة الرئيسة */
const mainNav = [
  { href: '/mishkah', label: 'مجتمع مشكاة', short: 'المجتمع', icon: Home },
  { href: '/mishkah/office', label: 'مكتبي', short: 'مكتبي', icon: Briefcase },
  { href: '/mishkah/services', label: 'خدمات مشكاة', short: 'الخدمات', icon: LayoutGrid },
  { href: '/mishkah/units', label: 'إدارات وفرق', short: 'الإدارات', icon: Users },
  { href: '/mishkah/knowledge', label: 'معرفة مشكاة', short: 'المعرفة', icon: BookOpen },
]

const secondaryNav = [
  { href: '/mishkah/calendar', label: 'التقويم واللقاءات', icon: Calendar },
  { href: '/mishkah/directory', label: 'دليل الموظفين', icon: Contact },
  { href: '/mishkah/notifications', label: 'الإشعارات', icon: Bell },
]

function isActive(pathname: string, href: string) {
  if (href === '/mishkah') return pathname === '/mishkah'
  return pathname.startsWith(href)
}

export function Shell({ children }: { children: ReactNode }) {
  const { hydrated, isAuthenticated, toasts, dismissToast } = useMishkah()

  return (
    <div className="mk-root" style={brandCssVars() as React.CSSProperties}>
      {!hydrated ? (
        <Splash />
      ) : !isAuthenticated ? (
        <LoginScreen />
      ) : (
        <AppFrame>{children}</AppFrame>
      )}
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

function Splash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Logo size={56} withText={false} />
      <p className="text-sm mk-muted">جارٍ فتح {brand.appName}…</p>
      <span className="mk-spinner mk-spinner-dark" />
    </div>
  )
}

function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { currentUser, notifications, requests } = useMishkah()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const unread = notifications.filter((n) => !n.read).length
  const myActions = requests.filter(
    (r) => r.currentOwnerId === currentUser.id && ['submitted', 'review', 'approved', 'returned'].includes(r.status),
  ).length

  return (
    <div className="min-h-screen">
      {/* الشريط العلوي */}
      <header className="mk-topbar">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/mishkah" className="flex items-center">
            <Logo size={38} />
          </Link>

          {/* روابط سطح المكتب */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mk-side-link ${isActive(pathname, item.href) ? 'mk-side-link-active' : ''}`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="mk-btn mk-btn-ghost mk-btn-sm"
              onClick={() => setSearchOpen(true)}
              aria-label="البحث الشامل"
            >
              <Search size={17} />
              <span className="hidden sm:inline">بحث</span>
            </button>

            <Link href="/mishkah/notifications" className="mk-btn mk-btn-ghost mk-btn-sm relative" aria-label="الإشعارات">
              <Bell size={17} />
              {unread > 0 && (
                <span
                  className="absolute -top-1 -left-1 mk-avatar"
                  style={{ width: 18, height: 18, background: 'var(--mk-danger)', fontSize: 10 }}
                >
                  {ar(unread)}
                </span>
              )}
            </Link>

            <button type="button" className="flex items-center gap-1.5" onClick={() => setMenuOpen(true)} aria-label="حسابي">
              <Avatar person={currentUser} size={34} />
              <ChevronDown size={14} className="mk-muted hidden sm:block" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 lg:py-7 flex gap-6">
        {/* القائمة الجانبية لسطح المكتب */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`mk-side-link ${isActive(pathname, item.href) ? 'mk-side-link-active' : ''}`}
              >
                <item.icon size={17} />
                {item.label}
                {item.href === '/mishkah/notifications' && unread > 0 && (
                  <span className="mk-badge mr-auto" style={{ background: 'var(--mk-danger)', color: '#fff' }}>
                    {ar(unread)}
                  </span>
                )}
              </Link>
            ))}

            {(currentUser.roles.some((r) => r.role === 'executive') ||
              currentUser.roles.some((r) => r.role === 'sysadmin')) && (
              <div className="pt-3 mt-3 border-t space-y-1" style={{ borderColor: 'var(--mk-line)' }}>
                <p className="text-xs font-bold mk-muted px-3 pb-1">إدارة المنصة</p>
                {currentUser.roles.some((r) => r.role === 'sysadmin') && (
                  <Link
                    href="/mishkah/admin"
                    className={`mk-side-link ${isActive(pathname, '/mishkah/admin') ? 'mk-side-link-active' : ''}`}
                  >
                    <Shield size={17} />
                    لوحة مدير النظام
                  </Link>
                )}
                <Link
                  href="/mishkah/insights"
                  className={`mk-side-link ${isActive(pathname, '/mishkah/insights') ? 'mk-side-link-active' : ''}`}
                >
                  <BarChart3 size={17} />
                  لوحة المؤشرات
                </Link>
              </div>
            )}

            {myActions > 0 && (
              <div
                className="mt-4 rounded-2xl p-3.5 text-sm"
                style={{ background: 'var(--mk-gold-soft)', color: 'var(--mk-warning)' }}
              >
                <p className="font-bold">لديك {ar(myActions)} طلبات تنتظر إجراءك</p>
                <Link href="/mishkah/office/inbox" className="mk-link text-xs mt-1 inline-block">
                  فتح صندوق الإجراءات ←
                </Link>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-24 lg:pb-8">{children}</main>
      </div>

      {/* شريط التنقل السفلي للجوال */}
      <nav className="mk-bottomnav lg:hidden">
        <div className="grid grid-cols-5">
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link key={item.href} href={item.href} className={`mk-navitem ${active ? 'mk-navitem-active' : ''}`}>
                <item.icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {item.short}
              </Link>
            )
          })}
        </div>
      </nav>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AccountMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}

/** قائمة الحساب + مبدّل الأدوار التجريبي */
function AccountMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, currentUserId, switchUser, logout, units, resetDemo } = useMishkah()
  const unit = units.find((u) => u.id === currentUser.unitId)

  return (
    <Modal open={open} onClose={onClose} title="حسابي وتبديل الدور">
      <div className="flex items-center gap-3">
        <Avatar person={currentUser} size={54} />
        <div className="min-w-0">
          <p className="font-bold truncate">{currentUser.name}</p>
          <p className="text-sm mk-muted truncate">{currentUser.title}</p>
          <p className="text-xs mk-muted mt-0.5">{unit?.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {roleNames(currentUser).map((r) => (
          <span key={r} className="mk-badge" style={{ background: 'var(--mk-primary-soft)', color: 'var(--mk-primary)' }}>
            {r}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold mb-1">تجربة المنصة من منظور دور آخر</p>
        <p className="text-xs mk-muted mb-2.5 leading-6">
          خيار تجريبي يغيّر المستخدم الحالي ليظهر لك المحتوى والصلاحيات المناسبة لكل دور.
        </p>
        <div className="space-y-1.5">
          {demoPersonas.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                switchUser(p.id)
                onClose()
              }}
              className={`w-full text-right mk-side-link ${currentUserId === p.id ? 'mk-side-link-active' : ''}`}
            >
              <UserCircle2 size={17} />
              <span className="flex-1">
                <span className="block">{p.label}</span>
                <span className="block text-xs mk-muted">{p.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t space-y-1" style={{ borderColor: 'var(--mk-line)' }}>
        <Link href="/mishkah/office/profile" onClick={onClose} className="mk-side-link">
          <UserCircle2 size={17} />
          ملفي الشخصي
        </Link>
        <button type="button" className="w-full text-right mk-side-link" onClick={() => { resetDemo(); onClose() }}>
          <RefreshCw size={17} />
          إعادة البيانات التجريبية
        </button>
        <button
          type="button"
          className="w-full text-right mk-side-link"
          style={{ color: 'var(--mk-danger)' }}
          onClick={() => {
            logout()
            onClose()
          }}
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>
    </Modal>
  )
}
