'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, BookOpen } from 'lucide-react'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-900" />
            </div>
            <span className="hidden sm:block">دليل الدورات القرآنية</span>
            <span className="sm:hidden">دليل الدورات</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-amber-300 transition-colors">الرئيسية</Link>
            <Link href="/add" className="hover:text-amber-300 transition-colors">أضف دورتك</Link>
            <Link href="/about" className="hover:text-amber-300 transition-colors">من نحن</Link>
            <Link href="/contact" className="hover:text-amber-300 transition-colors">تواصل معنا</Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/add"
              className="bg-amber-400 text-emerald-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-amber-300 transition-colors"
            >
              + أضف دورتك
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-emerald-800 transition-colors"
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-emerald-800 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              href="/add"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              أضف دورتك
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              من نحن
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              تواصل معنا
            </Link>
            <div className="pt-2">
              <Link
                href="/add"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-amber-400 text-emerald-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-300 transition-colors"
              >
                + أضف دورتك مجانًا
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
