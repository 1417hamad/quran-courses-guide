'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateShort } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Report {
  id: string
  program_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
  reviewed_at: string | null
  admin_notes: string | null
  program?: { id: string; title: string; slug: string } | null
}

interface Props {
  reports: Report[]
  total: number
  page: number
  perPage: number
  statusFilter?: string
}

const statusColors: Record<string, string> = {
  'جديد': 'bg-red-100 text-red-700',
  'قيد المراجعة': 'bg-yellow-100 text-yellow-700',
  'مغلق': 'bg-gray-100 text-gray-600',
  'مرفوض': 'bg-gray-100 text-gray-500',
}

export function AdminReportsTable({ reports, total, page, perPage, statusFilter }: Props) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const updateReport = async (id: string, status: string, notes?: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes }),
      })

      if (res.ok) {
        toast.success('تم تحديث البلاغ')
        router.refresh()
      } else {
        toast.error('حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setProcessingId(null)
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <>
      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex gap-2">
        {['', 'جديد', 'قيد المراجعة', 'مغلق', 'مرفوض'].map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/admin/reports${s ? `?status=${s}` : ''}`)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              statusFilter === s || (!statusFilter && !s)
                ? 'bg-emerald-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {s || 'الكل'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-start p-3 text-gray-600 font-medium">الإعلان</th>
              <th className="text-start p-3 text-gray-600 font-medium">السبب</th>
              <th className="text-start p-3 text-gray-600 font-medium hidden sm:table-cell">التاريخ</th>
              <th className="text-start p-3 text-gray-600 font-medium">الحالة</th>
              <th className="text-start p-3 text-gray-600 font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50/50">
                <td className="p-3">
                  {report.program ? (
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-36">{report.program.title}</p>
                      <Link
                        href={`/programs/${report.program.slug}`}
                        target="_blank"
                        className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        عرض
                      </Link>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">محذوف</span>
                  )}
                </td>
                <td className="p-3">
                  <p className="font-medium text-gray-900">{report.reason}</p>
                  {report.details && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-40">{report.details}</p>
                  )}
                </td>
                <td className="p-3 hidden sm:table-cell text-gray-500 text-xs">
                  {formatDateShort(report.created_at)}
                </td>
                <td className="p-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[report.status] || 'bg-gray-100 text-gray-600')}>
                    {report.status}
                  </span>
                </td>
                <td className="p-3">
                  {report.status === 'جديد' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateReport(report.id, 'مغلق')}
                        disabled={processingId === report.id}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="إغلاق"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateReport(report.id, 'مرفوض')}
                        disabled={processingId === report.id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="رفض"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">لا توجد بلاغات</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
