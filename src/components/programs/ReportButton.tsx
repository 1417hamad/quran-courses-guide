'use client'

import { useState } from 'react'
import { Flag, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { REPORT_REASONS } from '@/lib/constants'

interface ReportButtonProps {
  programId: string
  programTitle: string
}

export function ReportButton({ programId, programTitle }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      toast.error('اختر سبب البلاغ')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: programId,
          reason,
          details: details || null,
          turnstile_token: 'dev-bypass', // Replaced with real Turnstile in production
        }),
      })

      if (res.ok) {
        toast.success('تم إرسال البلاغ. شكرًا لمساهمتك.')
        setOpen(false)
        setReason('')
        setDetails('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'حدث خطأ أثناء إرسال البلاغ')
      }
    } catch {
      toast.error('حدث خطأ. يرجى المحاولة مجددًا.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors w-full justify-center"
      >
        <Flag className="w-3.5 h-3.5" />
        الإبلاغ عن الإعلان
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">الإبلاغ عن إعلان</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 truncate">
                {programTitle}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب البلاغ <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">اختر السبب...</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تفاصيل إضافية (اختياري)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="أضف تفاصيل تساعدنا في مراجعة البلاغ..."
                  rows={3}
                  maxLength={1000}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                  {loading ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
