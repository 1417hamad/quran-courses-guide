import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, Users, Clock, Eye, Tag, CheckCircle, XCircle } from 'lucide-react'
import type { Program } from '@/types'
import { formatDate, isRegistrationOpen, isProgramEnded } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProgramCardProps {
  program: Program
}

export function ProgramCard({ program }: ProgramCardProps) {
  const registrationOpen = isRegistrationOpen(program.registration_deadline)
  const ended = isProgramEnded(program.end_date)

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden">
        {program.image_url ? (
          <Image
            src={program.image_url}
            alt={program.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-emerald-600">
              <div className="text-4xl mb-2">📖</div>
              <p className="text-xs text-emerald-500">{program.program_type}</p>
            </div>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1">
          {ended ? (
            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">منتهية</span>
          ) : !registrationOpen ? (
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">التسجيل مغلق</span>
          ) : (
            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">التسجيل متاح</span>
          )}
        </div>

        {/* Fee badge */}
        <div className="absolute top-3 end-3">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            program.fee_type === 'مجانية'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-blue-100 text-blue-800'
          )}>
            {program.fee_type === 'مجانية' ? 'مجانية' : `${program.fee_amount} ر.س`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Type badge */}
        <span className="text-xs text-emerald-600 font-medium mb-1">{program.program_type}</span>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">
          {program.title}
        </h3>

        {/* Organization */}
        <p className="text-sm text-gray-600 mb-3 truncate">{program.organization_name}</p>

        {/* Info grid */}
        <div className="space-y-1.5 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{program.region} — {program.city}{program.district ? ` — ${program.district}` : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>{program.gender} · {program.delivery_mode}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>يبدأ {formatDate(program.start_date)}</span>
          </div>
          {registrationOpen && !ended && (
            <div className="flex items-center gap-1.5 text-amber-700">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>آخر تسجيل: {formatDate(program.registration_deadline)}</span>
            </div>
          )}
        </div>

        {/* Branches */}
        {program.branches.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {program.branches.slice(0, 3).map((branch) => (
              <span
                key={branch}
                className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-100"
              >
                {branch}
              </span>
            ))}
            {program.branches.length > 3 && (
              <span className="text-xs text-gray-400">+{program.branches.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{program.views_count.toLocaleString('ar-SA')}</span>
          </div>

          <Link
            href={`/programs/${program.slug}`}
            className="bg-emerald-700 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
          >
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </article>
  )
}
