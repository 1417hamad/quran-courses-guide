import type { Metadata } from 'next'
import { BookOpen, Target, Users, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'تعرف على دليل الدورات القرآنية ورسالتنا في خدمة المستفيدين',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-emerald-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">من نحن</h1>
        <p className="text-gray-600 text-lg">
          دليل الدورات القرآنية — منصة تجمع البرامج القرآنية في مكان واحد
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">رسالتنا</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            نسعى إلى تسهيل وصول المستفيدين إلى الدورات والبرامج القرآنية في جميع مناطق المملكة
            العربية السعودية، وذلك من خلال توفير دليل إلكتروني شامل يجمع إعلانات الجهات المختلفة
            في منصة واحدة سهلة الاستخدام.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">من يستفيد من المنصة؟</h2>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              الباحثون عن دورات قرآنية في منطقتهم
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              الجهات التي تقدم برامج قرآنية وتريد الإعلان عنها مجانًا
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              المساجد والجمعيات والمراكز القرآنية
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              أولياء الأمور الباحثون عن برامج لأبنائهم
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">التزاماتنا</h2>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              توفير منصة مجانية لإعلان الدورات القرآنية
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              المحافظة على خصوصية المستخدمين
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              مراجعة البلاغات والتحقق من الإعلانات
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              تطوير المنصة باستمرار لخدمة المستخدمين
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
