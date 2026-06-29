import type { Metadata } from 'next'
import { AddProgramForm } from '@/components/forms/AddProgramForm'

export const metadata: Metadata = {
  title: 'أضف دورتك',
  description: 'أضف إعلان دورتك أو برنامجك القرآني مجانًا في دليل الدورات القرآنية',
}

export default function AddPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">أضف دورتك</h1>
        <p className="text-gray-600">
          شارك دورتك أو برنامجك القرآني مع المستفيدين في جميع أنحاء المملكة.
          <br className="hidden sm:block" />
          الإضافة مجانية والنشر فوري.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <strong>تنبيه:</strong> تأكد من صحة جميع البيانات قبل الإرسال. أنت مسؤول عن محتوى الإعلان وصحة بياناته.
      </div>

      <AddProgramForm />
    </div>
  )
}
