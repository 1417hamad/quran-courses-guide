import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { programFormSchema } from '@/lib/validations'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitizeText, generateSlug } from '@/lib/utils'
import { RATE_LIMIT_PROGRAM_MAX, RATE_LIMIT_PROGRAM_WINDOW } from '@/lib/constants'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

    // Rate limiting
    const rateCheck = checkRateLimit(
      `program:${ipHash}`,
      RATE_LIMIT_PROGRAM_MAX,
      RATE_LIMIT_PROGRAM_WINDOW
    )

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'تجاوزت الحد المسموح به لإضافة الإعلانات. يرجى المحاولة لاحقًا.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate Turnstile (skip if no token provided)
    if (body.turnstile_token) {
      const turnstileValid = await verifyTurnstileToken(body.turnstile_token)
      if (!turnstileValid) {
        return NextResponse.json(
          { error: 'فشل التحقق من الهوية. يرجى المحاولة مجددًا.' },
          { status: 400 }
        )
      }
    }

    // Validate all fields
    const parsed = programFormSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json({ error: 'بيانات غير صحيحة', errors }, { status: 422 })
    }

    const data = parsed.data

    // Sanitize text fields
    const sanitized = {
      title: sanitizeText(data.title),
      description: sanitizeText(data.description),
      organization_name: sanitizeText(data.organization_name),
      instructor_name: data.instructor_name ? sanitizeText(data.instructor_name) : null,
      district: data.district ? sanitizeText(data.district) : null,
      custom_branch: data.custom_branch ? sanitizeText(data.custom_branch) : null,
      hidden_reason: null,
    }

    const supabase = await createAdminClient()

    // Generate a temp ID for slug
    const tempId = crypto.randomUUID()
    const slug = generateSlug(sanitized.title, tempId)

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('programs')
      .select('id')
      .eq('slug', slug)
      .single()

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const { data: program, error } = await supabase
      .from('programs')
      .insert({
        id: tempId,
        slug: finalSlug,
        program_type: data.program_type,
        title: sanitized.title,
        description: sanitized.description,
        organization_name: sanitized.organization_name,
        organization_type: data.organization_type,
        region: data.region,
        city: data.city,
        district: sanitized.district,
        delivery_mode: data.delivery_mode,
        gender: data.gender,
        age_groups: data.age_groups,
        branches: data.branches,
        custom_branch: sanitized.custom_branch,
        instructor_name: sanitized.instructor_name,
        phone: data.phone || null,
        show_phone: data.show_phone,
        whatsapp_number: data.whatsapp_number || null,
        registration_url: data.registration_url,
        maps_url: data.maps_url || null,
        start_date: data.start_date,
        end_date: data.end_date,
        registration_deadline: data.registration_deadline,
        schedule_days: data.schedule_days || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        fee_type: data.fee_type,
        fee_amount: data.fee_amount || null,
        status: 'active',
        is_active: true,
        image_url: null, // will be updated after upload
      })
      .select('id, slug')
      .single()

    if (error || !program) {
      console.error('Insert error:', error?.message)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء حفظ الإعلان. يرجى المحاولة مجددًا.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: program.id, slug: program.slug }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'حدث خطأ غير متوقع.' }, { status: 500 })
  }
}
