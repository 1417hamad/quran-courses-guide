'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import type { Program, ProgramFilters, PaginatedResult } from '@/types'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export async function getPrograms(
  filters: ProgramFilters = {}
): Promise<PaginatedResult<Program>> {
  const supabase = await createClient()

  const {
    search,
    region,
    city,
    district,
    gender,
    delivery_mode,
    fee_type,
    registration_open,
    sort = 'newest',
    page = 1,
    per_page = ITEMS_PER_PAGE,
  } = filters

  let query = supabase
    .from('programs')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .not('status', 'in', '("hidden","soft_deleted")')
    .eq('is_active', true)

  // Hide ended programs from default results
  const now = new Date().toISOString().split('T')[0]
  query = query.gte('end_date', now)

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,organization_name.ilike.%${search}%`
    )
  }

  if (region) query = query.eq('region', region)
  if (city) query = query.eq('city', city)
  if (district) query = query.ilike('district', `%${district}%`)
  if (gender) query = query.eq('gender', gender)
  if (delivery_mode) query = query.eq('delivery_mode', delivery_mode)
  if (fee_type) query = query.eq('fee_type', fee_type)

  if (registration_open) {
    query = query.gte('registration_deadline', now)
  }

  // Sorting
  switch (sort) {
    case 'most_viewed':
      query = query.order('views_count', { ascending: false })
      break
    case 'deadline_soon':
      query = query
        .gte('registration_deadline', now)
        .order('registration_deadline', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  // Pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching programs:', error.message)
    return { data: [], total: 0, page, per_page, total_pages: 0 }
  }

  const total = count || 0

  return {
    data: (data as Program[]) || [],
    total,
    page,
    per_page,
    total_pages: Math.ceil(total / per_page),
  }
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .not('status', 'in', '("hidden","soft_deleted")')
    .single()

  if (error || !data) return null
  return data as Program
}

export async function getProgramById(id: string): Promise<Program | null> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Program
}

export async function incrementViews(programId: string, ipHash: string): Promise<boolean> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase.rpc('increment_program_views', {
    p_program_id: programId,
    p_ip_hash: ipHash,
  })

  if (error) {
    console.error('Error incrementing views:', error.message)
    return false
  }

  return data === true
}
