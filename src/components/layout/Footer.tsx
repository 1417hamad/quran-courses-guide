import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-emerald-950 text-emerald-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-emerald-900" />
              </div>
              دليل الدورات القرآنية
            </Link>
            <p className="text-sm text-emerald-400 leading-relaxed">
              منصة تجمع إعلانات الدورات والبرامج القرآنية في المملكة العربية السعودية في مكان واحد.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-amber-300 transition-colors">الرئيسية</Link></li>
              <li><Link href="/add" className="hover:text-amber-300 transition-colors">أضف دورتك</Link></li>
              <li><Link href="/about" className="hover:text-amber-300 transition-colors">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-amber-300 transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">قانوني</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-amber-300 transition-colors">شروط الاستخدام</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-300 transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="/disclaimer" className="hover:text-amber-300 transition-colors">إخلاء المسؤولية</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-800 mt-8 pt-6 text-center text-xs text-emerald-500">
          <p>© {currentYear} دليل الدورات القرآنية. جميع الحقوق محفوظة.</p>
          <p className="mt-1">هذه المنصة دليل إعلاني. الجهة المعلنة مسؤولة عن صحة بيانات إعلانها.</p>
        </div>
      </div>
    </footer>
  )
}
