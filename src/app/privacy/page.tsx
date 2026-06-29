import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">سياسة الخصوصية</h1>
      <p className="text-sm text-gray-500 mb-8">آخر تحديث: يناير 2025</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-900 mb-2">١. البيانات التي نجمعها</h2>
          <p>عند إضافة إعلان، نجمع المعلومات التي تقدمها في النموذج مثل اسم الدورة والجهة وبيانات التواصل التي توافق على إظهارها. لا نجمع بيانات شخصية من المتصفحين.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٢. استخدام البيانات</h2>
          <p>نستخدم البيانات المقدمة لعرض الإعلانات للمستفيدين وتشغيل المنصة. لا نبيع بياناتك لأطراف ثالثة.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٣. أرقام التواصل</h2>
          <p>لا يُعرض رقم التواصل للعموم إلا بعد موافقتك الصريحة عند إضافة الإعلان. يمكنك اختيار عدم إظهار الرقم.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٤. الاحتفاظ بالبيانات</h2>
          <p>نحتفظ بالإعلانات في قاعدة البيانات لأغراض الأرشفة. يمكنك التواصل معنا لطلب حذف إعلانك.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٥. ملفات تعريف الارتباط</h2>
          <p>نستخدم ملفات تعريف الارتباط الضرورية لتشغيل الموقع فقط، ولا نستخدم ملفات تعريف الارتباط التتبعية.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٦. التواصل</h2>
          <p>لأي استفسار حول خصوصيتك، يمكنك التواصل معنا عبر صفحة التواصل.</p>
        </section>
      </div>
    </div>
  )
}
