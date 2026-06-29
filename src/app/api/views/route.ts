import { NextRequest, NextResponse } from 'next/server'
import { incrementViews } from '@/lib/actions/programs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { program_id } = body

    if (!program_id || typeof program_id !== 'string') {
      return NextResponse.json({ error: 'معرف الإعلان مطلوب' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + program_id).digest('hex')

    const counted = await incrementViews(program_id, ipHash)

    return NextResponse.json({ counted }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'خطأ' }, { status: 500 })
  }
}
