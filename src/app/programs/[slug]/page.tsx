import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, Calendar, Users, Clock, Eye, Tag, ExternalLink,
  Phone, MessageCircle, Share2, Copy, Flag, CheckCircle, XCircle,
  ArrowRight, Building, DollarSign
} from 'lucide-react'
import { getProgramBySlug } from '@/lib/actions/programs'
import { formatDate, isRegistrationOpen, isProgramEnded, getWhatsAppUrl, getProgramShareText } from '@/lib/utils'
import { ViewTracker } from '@/components/programs/ViewTracker'
import { ShareButtons } from '@/components/programs/ShareButtons'
import { ReportButton } from '@/components/programs/ReportButton'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const program = await getProgramBySlug(slug)

  if (!program) {
    return { title: 'الدورة غير موجودة' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quran-courses.vercel.app'
  const url = `${siteUrl}/programs/${program.slug}`

  return {
    title: program.title,
    description: program.description.slice(0, 160),
    openGraph: {
      title: program.title,
      description: `${program.organization_name} — ${program.region}، ${program.city}`,
      url,
      images: program.image_url ? [{ url: program.image_url, alt: program.title }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: program.title,
      description: `${program.organization_name} — ${program.region}، ${program.city}`,
      images: program.image_url ? [program.image_url] : [],
    },
    alternates: { canonical: url },
  }
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)

  if (!program) notFound()

  const registrationOpen = isRegistrationOpen(program.registration_deadline)
  const ended = isProgramEnded(program.end_date)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quran-courses.vercel.app'
  const programUrl = `${siteUrl}/programs/${program.slug}`

  return (
    <>
      <ViewTracker programId={program.id} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-700 transition-colors">الرئيسية</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <span className="text-gray-900 truncate">{program.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden bg-emerald-50 aspect-[16/9]">
              {program.image_url ? (
                <Image
                  src={program.image_url}
                  alt={program.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-emerald-600">
                  <div className="text-center">
                    <div className="text-6xl mb-3">📖</div>
                    <p className="text-sm text-emerald-500">{program.program_type}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="absolute top-4 start-4 flex flex-col gap-1">
                {ended ? (
                  <span className="bg-gray-700 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    الدورة منتهية
                  </span>
                ) : !registrationOpen ? (
                  <span className="bg-red-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    التسجيل مغلق
                  </span>
                ) : (
                  <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    التسجيل متاح
                  </span>
                )}
              </div>
            </div>

            {/* Title & org */}
            <div>
              <span className="text-sm text-emerald-600 font-medium">{program.program_type}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">
                {program.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <Building className="w-4 h-4 text-emerald-500" />
                <span>{program.organization_name}</span>
                <span className="text-gray-300">·</span>
                <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">{program.organization_type}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-3">وصف الدورة</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{program.description}</p>
            </div>

            {/* Details grid */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">تفاصيل الدورة</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">المنطقة</dt>
                  <dd className="font-medium text-gray-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    {program.region}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">المدينة</dt>
                  <dd className="font-medium text-gray-900">{program.city}</dd>
                </div>
                {program.district && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">الحي</dt>
                    <dd className="font-medium text-gray-900">{program.district}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">نمط الدورة</dt>
                  <dd className="font-medium text-gray-900">{program.delivery_mode}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">الجنس المستفيد</dt>
                  <dd className="font-medium text-gray-900 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    {program.gender}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">الفئة العمرية</dt>
                  <dd className="font-medium text-gray-900">{program.age_groups.join('، ')}</dd>
                </div>
                {program.instructor_name && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">المعلم / المشرف</dt>
                    <dd className="font-medium text-gray-900">{program.instructor_name}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">الرسوم</dt>
                  <dd className="font-medium text-gray-900 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    {program.fee_type === 'مجانية'
                      ? 'مجانية'
                      : `${program.fee_amount?.toLocaleString('ar-SA')} ريال`}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Branches */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                فروع الدورة
              </h2>
              <div className="flex flex-wrap gap-2">
                {program.branches.map((branch) => (
                  <span
                    key={branch}
                    className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-sm"
                  >
                    {branch}
                  </span>
                ))}
                {program.custom_branch && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-sm">
                    {program.custom_branch}
                  </span>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                المواعيد
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">تاريخ البداية</dt>
                  <dd className="font-medium text-gray-900">{formatDate(program.start_date)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">تاريخ النهاية</dt>
                  <dd className="font-medium text-gray-900">{formatDate(program.end_date)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">آخر موعد للتسجيل</dt>
                  <dd className={`font-medium ${registrationOpen ? 'text-amber-700' : 'text-red-600'}`}>
                    {formatDate(program.registration_deadline)}
                    {!registrationOpen && <span className="text-xs me-1"> (منتهٍ)</span>}
                  </dd>
                </div>
                {program.schedule_days && program.schedule_days.length > 0 && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">أيام الدورة</dt>
                    <dd className="font-medium text-gray-900">{program.schedule_days.join('، ')}</dd>
                  </div>
                )}
                {program.start_time && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">وقت البداية</dt>
                    <dd className="font-medium text-gray-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {program.start_time}
                    </dd>
                  </div>
                )}
                {program.end_time && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">وقت النهاية</dt>
                    <dd className="font-medium text-gray-900">{program.end_time}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20">
              <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{program.views_count.toLocaleString('ar-SA')} مشاهدة</span>
                </div>
                <span>نُشر {formatDate(program.created_at)}</span>
              </div>

              {/* Registration button */}
              {!ended && registrationOpen ? (
                <a
                  href={program.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors mb-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  سجّل الآن
                </a>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-3 rounded-xl font-bold mb-3 cursor-not-allowed">
                  <XCircle className="w-4 h-4" />
                  {ended ? 'الدورة منتهية' : 'انتهى التسجيل'}
                </div>
              )}

              {/* Maps button */}
              {program.maps_url && (
                <a
                  href={program.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors mb-3"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  الموقع على الخريطة
                </a>
              )}

              {/* Phone */}
              {program.show_phone && program.phone && (
                <div className="border border-gray-100 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">رقم التواصل</p>
                  <a
                    href={`tel:${program.phone}`}
                    className="flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-600"
                  >
                    <Phone className="w-4 h-4" />
                    {program.phone}
                  </a>
                </div>
              )}

              {/* WhatsApp */}
              {program.whatsapp_number && (
                <a
                  href={getWhatsAppUrl(
                    program.whatsapp_number,
                    `مرحباً، أريد الاستفسار عن دورة: ${program.title}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-xl text-sm hover:bg-green-100 transition-colors mb-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  تواصل عبر واتساب
                </a>
              )}

              {/* Share */}
              <ShareButtons
                url={programUrl}
                title={program.title}
                organization={program.organization_name}
              />

              {/* Report */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ReportButton programId={program.id} programTitle={program.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
