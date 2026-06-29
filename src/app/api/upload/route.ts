import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/lib/constants'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const programId = formData.get('program_id') as string | null

    if (!file || !programId) {
      return NextResponse.json({ error: 'الملف ومعرف الإعلان مطلوبان' }, { status: 400 })
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مقبول. يُقبل JPG وPNG وWebP فقط.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جدًا. الحد الأقصى 5 ميغابايت.' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // Verify program exists
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('id')
      .eq('id', programId)
      .single()

    if (programError || !program) {
      return NextResponse.json({ error: 'الإعلان غير موجود' }, { status: 404 })
    }

    // Generate random filename
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
    const fileName = `${crypto.randomUUID()}.${ext}`
    const filePath = `programs/${programId}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('program-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError.message)
      return NextResponse.json({ error: 'فشل رفع الصورة. يرجى المحاولة مجددًا.' }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('program-images').getPublicUrl(filePath)

    // Update program with image URL
    const { error: updateError } = await supabase
      .from('programs')
      .update({ image_url: publicUrl })
      .eq('id', programId)

    if (updateError) {
      console.error('Update error:', updateError.message)
    }

    return NextResponse.json({ url: publicUrl }, { status: 200 })
  } catch (err) {
    console.error('Upload unexpected error:', err)
    return NextResponse.json({ error: 'حدث خطأ غير متوقع.' }, { status: 500 })
  }
}
