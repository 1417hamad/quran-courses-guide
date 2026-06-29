import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { reportSchema } from '@/lib/validations'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { checkRateLimit } from '@/lib/rate-limit'
import { RATE_LIMIT_REPORT_MAX, RATE_LIMIT_REPORT_WINDOW } from '@/lib/constants'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

    // Rate limiting
    const rateCheck = checkRateLimit(
      `report:${ipHash}`,
      RATE_LIMIT_REPORT_MAX,
      RATE_LIMIT_REPORT_WINDOW
    )

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'تجاوزت الحد المسموح به لإرسال البلاغات.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Verify Turnstile
    const turnstileValid = await verifyTurnstileToken(body.turnstile_token)
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'فشل التحقق من الهوية. يرجى المحاولة مجددًا.' },
        { status: 400 }
      )
    }

    // Validate
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 422 })
    }

    const { program_id, reason, details } = parsed.data

    const supabase = await createAdminClient()

    const { error } = await supabase.from('program_reports').insert({
      program_id,
      reason,
      details: details || null,
      status: 'جديد',
    })

    if (error) {
      console.error('Report insert error:', error.message)
      return NextResponse.json({ error: 'حدث خطأ أثناء إرسال البلاغ.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ غير متوقع.' }, { status: 500 })
  }
}
