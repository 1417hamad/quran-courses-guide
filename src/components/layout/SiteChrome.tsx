'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

/**
 * يعرض ترويسة وتذييل «دليل الدورات القرآنية» لصفحات الموقع العام فقط.
 * مسار /mishkah (بيئة مشكاة الرقمية) يملك واجهته الكاملة الخاصة به.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname?.startsWith('/mishkah')) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
