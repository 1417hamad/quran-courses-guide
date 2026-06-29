import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'شروط الاستخدام',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">شروط الاستخدام</h1>
      <p className="text-sm text-gray-500 mb-8">آخر تحديث: يناير 2025</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-900 mb-2">١. القبول بالشروط</h2>
          <p>باستخدام منصة دليل الدورات القرآنية، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٢. طبيعة المنصة</h2>
          <p>
            المنصة دليل إعلاني يتيح للجهات نشر إعلانات دوراتها وبرامجها القرآنية. لا تتحقق المنصة
            من صحة جميع البيانات المنشورة، والمسؤولية الكاملة تقع على عاتق الجهة المعلنة.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٣. إضافة الإعلانات</h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>يجب أن تكون المعلومات المدخلة صحيحة ودقيقة</li>
            <li>يُحظر نشر معلومات مضللة أو إعلانات احتيالية</li>
            <li>يُحظر نشر محتوى مسيء أو مخالف للقيم الإسلامية</li>
            <li>يحق للمنصة حذف أي إعلان يخالف هذه الشروط</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٤. المسؤولية</h2>
          <p>
            المنصة غير مسؤولة عن صحة المعلومات التي تقدمها الجهات المعلنة، ولا عن أي ضرر
            قد ينتج عن الاعتماد على هذه المعلومات.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">٥. التعديلات</h2>
          <p>تحتفظ المنصة بحق تعديل هذه الشروط في أي وقت، مع الإشعار المسبق للمستخدمين.</p>
        </section>
      </div>
    </div>
  )
}
