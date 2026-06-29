'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Loader2, LogOut, LayoutDashboard, FileText, Flag } from 'lucide-react'
import Link from 'next/link'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user && pathname !== '/admin/login') {
        router.replace('/admin/login')
      } else {
        setAuthed(!!user)
        setChecking(false)
      }
    })
  }, [router, pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!authed) return null

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-emerald-900 text-white fixed h-full z-40 flex flex-col">
        <div className="p-4 border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-900" />
            </div>
            <div>
              <p className="text-xs font-bold">لوحة التحكم</p>
              <p className="text-xs text-emerald-400">المدير</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/admin/dashboard'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            لوحة التحكم
          </Link>
          <Link
            href="/admin/programs"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith('/admin/programs')
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            الإعلانات
          </Link>
          <Link
            href="/admin/reports"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith('/admin/reports')
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <Flag className="w-4 h-4" />
            البلاغات
          </Link>
        </nav>

        <div className="p-3 border-t border-emerald-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-200 hover:bg-emerald-800 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-200 hover:bg-emerald-800 transition-colors"
            target="_blank"
          >
            عرض الموقع
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 me-56">
        {children}
      </main>
    </div>
  )
}
