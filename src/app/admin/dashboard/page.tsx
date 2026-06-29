import { createAdminClient } from '@/lib/supabase/server'
import { FileText, Eye, Flag, TrendingUp, Clock, CheckCircle, EyeOff, Trash2 } from 'lucide-react'

async function getStats() {
  const supabase = await createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [
    { count: total },
    { count: active },
    { count: hidden },
    { count: ended },
    { count: softDeleted },
    { count: addedToday },
    { count: addedThisMonth },
    viewsResult,
    { count: openReports },
    topPrograms,
  ] = await Promise.all([
    supabase.from('programs').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('programs').select('*', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
    supabase.from('programs').select('*', { count: 'exact', head: true }).eq('status', 'hidden').is('deleted_at', null),
    supabase.from('programs').select('*', { count: 'exact', head: true }).eq('status', 'ended').is('deleted_at', null),
    supabase.from('programs').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null),
    supabase.from('programs').select('*', { count: 'exact', head: true }).gte('created_at', today).is('deleted_at', null),
    supabase.from('programs').select('*', { count: 'exact', head: true }).gte('created_at', monthStart).is('deleted_at', null),
    supabase.from('programs').select('views_count').is('deleted_at', null),
    supabase.from('program_reports').select('*', { count: 'exact', head: true }).eq('status', 'جديد'),
    supabase.from('programs').select('id, title, slug, views_count').is('deleted_at', null).order('views_count', { ascending: false }).limit(5),
  ])

  const totalViews = (viewsResult.data || []).reduce(
    (sum: number, p: { views_count: number }) => sum + (p.views_count || 0), 0
  )

  return {
    total: total || 0,
    active: active || 0,
    hidden: hidden || 0,
    ended: ended || 0,
    softDeleted: softDeleted || 0,
    addedToday: addedToday || 0,
    addedThisMonth: addedThisMonth || 0,
    totalViews,
    openReports: openReports || 0,
    topPrograms: topPrograms.data || [],
  }
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString('ar-SA') : value}</p>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-sm text-gray-500">نظرة عامة على المنصة</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="إجمالي الإعلانات" value={stats.total} icon={FileText} color="bg-blue-50 text-blue-600" />
        <StatCard label="نشط" value={stats.active} icon={CheckCircle} color="bg-green-50 text-green-600" />
        <StatCard label="مخفي" value={stats.hidden} icon={EyeOff} color="bg-orange-50 text-orange-600" />
        <StatCard label="منتهٍ" value={stats.ended} icon={Clock} color="bg-gray-50 text-gray-600" />
        <StatCard label="محذوف مؤقتًا" value={stats.softDeleted} icon={Trash2} color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="مضافة اليوم" value={stats.addedToday} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="مضافة هذا الشهر" value={stats.addedThisMonth} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="إجمالي المشاهدات" value={stats.totalViews} icon={Eye} color="bg-purple-50 text-purple-600" />
        <StatCard label="بلاغات مفتوحة" value={stats.openReports} icon={Flag} color="bg-red-50 text-red-600" />
      </div>

      {/* Top programs */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          أكثر الدورات مشاهدة
        </h2>
        <div className="space-y-2">
          {stats.topPrograms.map((program: { id: string; title: string; slug: string; views_count: number }, index: number) => (
            <div key={program.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-gray-900 truncate">{program.title}</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="w-3 h-3" />
                {program.views_count.toLocaleString('ar-SA')}
              </div>
            </div>
          ))}
          {stats.topPrograms.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات بعد</p>
          )}
        </div>
      </div>
    </div>
  )
}
