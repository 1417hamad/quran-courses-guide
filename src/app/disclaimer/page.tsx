import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إخلاء المسؤولية',
}

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">إخلاء المسؤولية</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-amber-800">
        <p className="font-semibold">تنبيه مهم</p>
        <p className="text-sm mt-1">يرجى قراءة هذه الصفحة بعناية قبل الاعتماد على أي معلومات في هذه المنصة.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-900 mb-2">طبيعة المنصة</h2>
          <p>
            دليل الدورات القرآنية هو دليل إعلاني يجمع إعلانات الجهات المختلفة في مكان واحد.
            المنصة ليست جهة ترخيص أو اعتماد، ولا تضمن جودة أو صحة المحتوى المنشور.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">مسؤولية الجهة المعلنة</h2>
          <p>
            الجهة المعلنة تتحمل المسؤولية الكاملة عن صحة ودقة البيانات المنشورة في إعلانها،
            بما في ذلك أوقات الدورة وأماكنها وتكاليفها وجودتها.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">مسؤولية المستخدم</h2>
          <p>
            يتحمل المستخدم مسؤولية التحقق من المعلومات قبل التسجيل في أي دورة أو دفع أي رسوم.
            يُنصح بالتواصل مع الجهة المعلنة مباشرة للتأكد من التفاصيل.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">عدم ضمان الجودة</h2>
          <p>
            لا تضمن المنصة جودة أو كفاءة أو اعتماد الدورات المعروضة. الاختيار والقرار النهائي
            يعود للمستخدم بالكامل.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 mb-2">الإبلاغ عن المشاكل</h2>
          <p>
            في حال وجدت إعلانًا يحتوي على معلومات غير صحيحة أو مضللة، يرجى استخدام زر
            «الإبلاغ عن الإعلان» في صفحة الإعلان، وسيتم مراجعته في أقرب وقت.
          </p>
        </section>
      </div>
    </div>
  )
}
