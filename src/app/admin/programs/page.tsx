import { createAdminClient } from '@/lib/supabase/server'
import { AdminProgramsTable } from '@/components/admin/AdminProgramsTable'
import type { Program } from '@/types'

interface PageProps {
  searchParams: Promise<{
    search?: string
    region?: string
    status?: string
    page?: string
  }>
}

export default async function AdminProgramsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const perPage = 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const supabase = await createAdminClient()

  let query = supabase
    .from('programs')
    .select('*, program_reports(count)', { count: 'exact' })

  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,organization_name.ilike.%${params.search}%`
    )
  }
  if (params.region) query = query.eq('region', params.region)
  if (params.status) {
    if (params.status === 'soft_deleted') {
      query = query.not('deleted_at', 'is', null)
    } else {
      query = query.eq('status', params.status).is('deleted_at', null)
    }
  } else {
    query = query.is('deleted_at', null)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, count } = await query

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">إدارة الإعلانات</h1>
          <p className="text-sm text-gray-500">{count || 0} إعلان</p>
        </div>
      </div>

      <AdminProgramsTable
        programs={(data as Program[]) || []}
        total={count || 0}
        page={page}
        perPage={perPage}
        filters={{ search: params.search, region: params.region, status: params.status }}
      />
    </div>
  )
}
