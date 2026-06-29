import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const user = await verifyAdmin()
  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await request.json()
  const { action, reason } = body

  const supabase = await createAdminClient()

  let updateData: Record<string, unknown> = {}
  let logAction = action

  switch (action) {
    case 'hide':
      updateData = { status: 'hidden', hidden_reason: reason || null }
      break
    case 'show':
      updateData = { status: 'active', hidden_reason: null }
      break
    case 'soft_delete':
      updateData = { status: 'soft_deleted', deleted_at: new Date().toISOString() }
      break
    case 'restore':
      updateData = { status: 'active', deleted_at: null }
      break
    case 'hard_delete': {
      // Get image URL first for cleanup
      const { data: program } = await supabase
        .from('programs')
        .select('image_url')
        .eq('id', id)
        .single()

      if (program?.image_url) {
        const urlParts = program.image_url.split('/program-images/')
        if (urlParts[1]) {
          await supabase.storage.from('program-images').remove([urlParts[1]])
        }
      }

      const { error } = await supabase.from('programs').delete().eq('id', id)
      if (error) {
        return NextResponse.json({ error: 'فشل حذف الإعلان' }, { status: 500 })
      }

      // Log action
      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'hard_delete',
        program_id: id,
        details: { reason },
      })

      return NextResponse.json({ success: true })
    }
    default:
      return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 })
  }

  const { error } = await supabase
    .from('programs')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'فشلت العملية' }, { status: 500 })
  }

  // Log action
  await supabase.from('admin_audit_logs').insert({
    admin_id: user.id,
    action: logAction,
    program_id: id,
    details: { reason },
  })

  return NextResponse.json({ success: true })
}
