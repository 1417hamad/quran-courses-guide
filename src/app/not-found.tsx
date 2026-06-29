import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">الصفحة غير موجودة</h1>
      <p className="text-gray-600 mb-8">
        عذرًا، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium"
        >
          العودة للرئيسية
        </Link>
        <Link
          href="/add"
          className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          أضف دورتك
        </Link>
      </div>
    </div>
  )
}
