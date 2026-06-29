import { createAdminClient } from '@/lib/supabase/server'
import { AdminReportsTable } from '@/components/admin/AdminReportsTable'

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const perPage = 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const supabase = await createAdminClient()

  let query = supabase
    .from('program_reports')
    .select(`
      *,
      program:programs(id, title, slug)
    `, { count: 'exact' })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, count } = await query

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">البلاغات</h1>
        <p className="text-sm text-gray-500">{count || 0} بلاغ</p>
      </div>

      <AdminReportsTable
        reports={data || []}
        total={count || 0}
        page={page}
        perPage={perPage}
        statusFilter={params.status}
      />
    </div>
  )
}
