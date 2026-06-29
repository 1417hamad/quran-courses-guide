import type { Metadata } from 'next'
import { Mail, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'تواصل معنا',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">تواصل معنا</h1>
        <p className="text-gray-600">نسعد بتواصلك معنا لأي استفسار أو ملاحظة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="font-bold text-gray-900 mb-1">البريد الإلكتروني</h2>
          <p className="text-sm text-gray-500 mb-3">للاستفسارات العامة والشراكات</p>
          <a
            href="mailto:info@quran-courses.sa"
            className="text-emerald-700 hover:underline text-sm"
          >
            info@quran-courses.sa
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="font-bold text-gray-900 mb-1">واتساب</h2>
          <p className="text-sm text-gray-500 mb-3">للتواصل السريع والدعم الفني</p>
          <a
            href="https://wa.me/966500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 hover:underline text-sm"
          >
            966500000000+
          </a>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-6 text-sm text-amber-800">
        <strong>ملاحظة:</strong> لطلب حذف إعلان معين أو الإبلاغ عن مشكلة، استخدم زر
        «الإبلاغ عن الإعلان» في صفحة الإعلان مباشرة لسرعة المعالجة.
      </div>
    </div>
  )
}
