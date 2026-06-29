import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await request.json()
  const { status, admin_notes } = body

  const adminSupabase = await createAdminClient()

  const { error } = await adminSupabase
    .from('program_reports')
    .update({
      status,
      admin_notes: admin_notes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'فشل التحديث' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
