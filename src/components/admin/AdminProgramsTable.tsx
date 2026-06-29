'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  Eye, EyeOff, Trash2, RotateCcw, ExternalLink, Copy, Search, ChevronLeft, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import type { Program } from '@/types'
import { PROGRAM_STATUS_LABELS, PROGRAM_STATUS_COLORS } from '@/lib/constants'
import { formatDateShort } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  programs: Program[]
  total: number
  page: number
  perPage: number
  filters: { search?: string; region?: string; status?: string }
}

export function AdminProgramsTable({ programs, total, page, perPage, filters }: Props) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [confirmAction, setConfirmAction] = useState<{
    id: string
    action: 'hide' | 'show' | 'soft_delete' | 'restore' | 'hard_delete'
    title: string
  } | null>(null)
  const [hideReason, setHideReason] = useState('')

  const totalPages = Math.ceil(total / perPage)

  const buildParams = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { search: filters.search, region: filters.region, status: filters.status, page: String(page), ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    return params.toString()
  }

  const handleSearch = () => {
    router.push(`/admin/programs?${buildParams({ search: searchInput, page: '1' })}`)
  }

  const handleAction = async () => {
    if (!confirmAction) return
    setProcessingId(confirmAction.id)

    try {
      const res = await fetch(`/api/admin/programs/${confirmAction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: confirmAction.action,
          reason: hideReason || undefined,
        }),
      })

      if (res.ok) {
        const messages: Record<string, string> = {
          hide: 'تم إخفاء الإعلان',
          show: 'تم إظهار الإعلان',
          soft_delete: 'تم حذف الإعلان مؤقتًا',
          restore: 'تمت استعادة الإعلان',
          hard_delete: 'تم حذف الإعلان نهائيًا',
        }
        toast.success(messages[confirmAction.action])
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setProcessingId(null)
      setConfirmAction(null)
      setHideReason('')
    }
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/programs/${slug}`
    navigator.clipboard.writeText(url).then(() => toast.success('تم نسخ الرابط'))
  }

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-48 gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="بحث..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSearch}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <select
          value={filters.status || ''}
          onChange={(e) => router.push(`/admin/programs?${buildParams({ status: e.target.value || undefined, page: '1' })}`)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="hidden">مخفي</option>
          <option value="ended">منتهٍ</option>
          <option value="soft_deleted">محذوف مؤقتًا</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-start p-3 text-gray-600 font-medium">الإعلان</th>
                <th className="text-start p-3 text-gray-600 font-medium hidden md:table-cell">المنطقة</th>
                <th className="text-start p-3 text-gray-600 font-medium hidden lg:table-cell">التاريخ</th>
                <th className="text-start p-3 text-gray-600 font-medium">الحالة</th>
                <th className="text-start p-3 text-gray-600 font-medium hidden sm:table-cell">المشاهدات</th>
                <th className="text-start p-3 text-gray-600 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex-shrink-0 overflow-hidden">
                        {program.image_url ? (
                          <Image
                            src={program.image_url}
                            alt={program.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-400 text-lg">📖</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-40">{program.title}</p>
                        <p className="text-xs text-gray-500 truncate">{program.organization_name}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 hidden md:table-cell text-gray-600 text-xs">
                    {program.region}<br />{program.city}
                  </td>

                  <td className="p-3 hidden lg:table-cell text-gray-600 text-xs">
                    {formatDateShort(program.created_at)}<br />
                    <span className="text-amber-600">ينتهي {formatDateShort(program.registration_deadline)}</span>
                  </td>

                  <td className="p-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', PROGRAM_STATUS_COLORS[program.status])}>
                      {PROGRAM_STATUS_LABELS[program.status]}
                    </span>
                  </td>

                  <td className="p-3 hidden sm:table-cell text-gray-600">
                    {program.views_count.toLocaleString('ar-SA')}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/programs/${program.slug}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="عرض"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => copyLink(program.slug)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="نسخ الرابط"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {program.deleted_at ? (
                        <button
                          onClick={() => setConfirmAction({ id: program.id, action: 'restore', title: program.title })}
                          disabled={processingId === program.id}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="استعادة"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : program.status === 'hidden' ? (
                        <button
                          onClick={() => setConfirmAction({ id: program.id, action: 'show', title: program.title })}
                          disabled={processingId === program.id}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="إظهار"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmAction({ id: program.id, action: 'hide', title: program.title })}
                          disabled={processingId === program.id}
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="إخفاء"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!program.deleted_at && (
                        <button
                          onClick={() => setConfirmAction({ id: program.id, action: 'soft_delete', title: program.title })}
                          disabled={processingId === program.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف مؤقت"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {program.deleted_at && (
                        <button
                          onClick={() => setConfirmAction({ id: program.id, action: 'hard_delete', title: program.title })}
                          disabled={processingId === program.id}
                          className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف نهائي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {programs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    لا توجد إعلانات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              صفحة {page} من {totalPages}
            </p>
            <div className="flex gap-1">
              <Link
                href={`/admin/programs?${buildParams({ page: String(Math.max(1, page - 1)) })}`}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  page <= 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/programs?${buildParams({ page: String(Math.min(totalPages, page + 1)) })}`}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  page >= totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">
              {confirmAction.action === 'hide' && 'إخفاء الإعلان'}
              {confirmAction.action === 'show' && 'إظهار الإعلان'}
              {confirmAction.action === 'soft_delete' && 'حذف الإعلان مؤقتًا'}
              {confirmAction.action === 'restore' && 'استعادة الإعلان'}
              {confirmAction.action === 'hard_delete' && '⚠️ حذف نهائي'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {confirmAction.title}
            </p>

            {confirmAction.action === 'hide' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سبب الإخفاء (اختياري)
                </label>
                <input
                  type="text"
                  value={hideReason}
                  onChange={(e) => setHideReason(e.target.value)}
                  placeholder="سبب الإخفاء..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            {confirmAction.action === 'hard_delete' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الإعلان وصورته نهائيًا.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAction}
                className={cn(
                  'flex-1 py-2 rounded-lg font-medium text-white transition-colors',
                  confirmAction.action === 'hard_delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmAction.action === 'hide' || confirmAction.action === 'soft_delete'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-emerald-700 hover:bg-emerald-600'
                )}
              >
                تأكيد
              </button>
              <button
                onClick={() => { setConfirmAction(null); setHideReason('') }}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
