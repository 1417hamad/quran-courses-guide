import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, BookOpen, Search } from 'lucide-react'
import { SearchFilters } from '@/components/programs/SearchFilters'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { ProgramCardSkeleton } from '@/components/programs/ProgramCardSkeleton'
import { getPrograms } from '@/lib/actions/programs'
import type { ProgramFilters, DeliveryMode, Gender, FeeType } from '@/types'

interface PageProps {
  searchParams: Promise<{
    search?: string
    region?: string
    city?: string
    district?: string
    gender?: string
    delivery_mode?: string
    fee_type?: string
    registration_open?: string
    sort?: string
    page?: string
  }>
}

async function ProgramsGrid({ filters }: { filters: ProgramFilters }) {
  const result = await getPrograms(filters)

  if (result.data.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
        <p className="text-gray-500 mb-6">
          لم نجد دورات تطابق بحثك. جرّب تعديل الفلاتر أو مسحها.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          مسح الفلاتر
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{result.total.toLocaleString('ar-SA')}</span> دورة
          {filters.search && ` لـ «${filters.search}»`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {result.data.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>

      {result.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: Math.min(result.total_pages, 10) }, (_, i) => i + 1).map((p) => {
            const ps = new URLSearchParams()
            if (filters.search) ps.set('search', filters.search)
            if (filters.region) ps.set('region', filters.region)
            if (filters.city) ps.set('city', filters.city)
            if (filters.sort && filters.sort !== 'newest') ps.set('sort', filters.sort)
            ps.set('page', String(p))

            return (
              <Link
                key={p}
                href={`/?${ps.toString()}`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === result.page
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProgramsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProgramCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: ProgramFilters = {
    search: params.search,
    region: params.region,
    city: params.city,
    district: params.district,
    gender: params.gender as Gender | undefined,
    delivery_mode: params.delivery_mode as DeliveryMode | undefined,
    fee_type: params.fee_type as FeeType | undefined,
    registration_open: params.registration_open === 'true',
    sort: (params.sort as ProgramFilters['sort']) || 'newest',
    page: params.page ? parseInt(params.page) : 1,
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-emerald-900 text-white py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-700 rounded-full px-4 py-1.5 text-sm text-emerald-200 mb-6">
            <BookOpen className="w-4 h-4" />
            دليل شامل للبرامج القرآنية
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            دليل الدورات القرآنية
          </h1>
          <p className="text-lg text-emerald-200 max-w-2xl mx-auto mb-8">
            اكتشف الدورات والبرامج القرآنية في جميع مناطق المملكة العربية السعودية.
            <br className="hidden sm:block" />
            ابحث وتصفح وسجّل في الدورة المناسبة لك.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/add"
              className="inline-flex items-center justify-center gap-2 bg-amber-400 text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-300 transition-colors"
            >
              <Plus className="w-5 h-5" />
              أضف دورتك مجانًا
            </Link>
            <a
              href="#programs"
              className="inline-flex items-center justify-center gap-2 bg-emerald-800/60 border border-emerald-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-800 transition-colors"
            >
              <Search className="w-5 h-5" />
              تصفح الدورات
            </a>
          </div>

          <div className="flex justify-center gap-8 mt-12 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-400">١٣</div>
              <div className="text-xs text-emerald-300">منطقة مدعومة</div>
            </div>
            <div className="w-px bg-emerald-700" />
            <div>
              <div className="text-2xl font-bold text-amber-400">مجاني</div>
              <div className="text-xs text-emerald-300">إضافة الإعلانات</div>
            </div>
            <div className="w-px bg-emerald-700" />
            <div>
              <div className="text-2xl font-bold text-amber-400">فوري</div>
              <div className="text-xs text-emerald-300">نشر الإعلان</div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="container mx-auto px-4 py-10">
        <Suspense fallback={<div className="h-28 bg-white rounded-2xl animate-pulse mb-6" />}>
          <SearchFilters />
        </Suspense>

        <Suspense fallback={<ProgramsGridSkeleton />}>
          <ProgramsGrid filters={filters} />
        </Suspense>
      </section>
    </div>
  )
}
