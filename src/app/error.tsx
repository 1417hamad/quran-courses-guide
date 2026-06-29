'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">حدث خطأ</h1>
      <p className="text-gray-600 mb-8">
        عذرًا، حدث خطأ غير متوقع. يرجى المحاولة مجددًا.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center bg-emerald-700 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium"
        >
          المحاولة مجددًا
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
