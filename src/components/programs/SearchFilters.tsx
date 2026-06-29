'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { REGIONS, getCitiesByRegion } from '@/lib/regions'
import { DELIVERY_MODES, GENDERS, FEE_TYPES } from '@/lib/constants'

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const getValue = (key: string) => searchParams.get(key) || ''

  const [search, setSearch] = useState(getValue('search'))
  const [region, setRegion] = useState(getValue('region'))
  const [city, setCity] = useState(getValue('city'))
  const [district, setDistrict] = useState(getValue('district'))
  const [gender, setGender] = useState(getValue('gender'))
  const [deliveryMode, setDeliveryMode] = useState(getValue('delivery_mode'))
  const [feeType, setFeeType] = useState(getValue('fee_type'))
  const [registrationOpen, setRegistrationOpen] = useState(getValue('registration_open') === 'true')
  const [sort, setSort] = useState(getValue('sort') || 'newest')

  const cities = region ? getCitiesByRegion(region) : []

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion)
    setCity('')
  }

  const buildParams = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (region) params.set('region', region)
    if (city) params.set('city', city)
    if (district) params.set('district', district)
    if (gender) params.set('gender', gender)
    if (deliveryMode) params.set('delivery_mode', deliveryMode)
    if (feeType) params.set('fee_type', feeType)
    if (registrationOpen) params.set('registration_open', 'true')
    if (sort && sort !== 'newest') params.set('sort', sort)
    return params
  }, [search, region, city, district, gender, deliveryMode, feeType, registrationOpen, sort])

  const handleSearch = () => {
    const params = buildParams()
    router.push(`/?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    setRegion('')
    setCity('')
    setDistrict('')
    setGender('')
    setDeliveryMode('')
    setFeeType('')
    setRegistrationOpen(false)
    setSort('newest')
    router.push('/')
  }

  const hasFilters = search || region || city || district || gender || deliveryMode || feeType || registrationOpen || sort !== 'newest'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
      {/* Main search row */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="ابحث بالاسم أو الجهة أو الوصف..."
            className="w-full ps-10 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          بحث
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 border border-gray-200 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">فلاتر</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          {/* Region */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">المنطقة</label>
            <select
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">جميع المناطق</option>
              {REGIONS.map((r) => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">المدينة</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!region}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">{region ? 'جميع المدن' : 'اختر المنطقة أولًا'}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">الحي</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="ابحث بالحي..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">الجنس</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">الجميع</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Delivery mode */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">نمط الدورة</label>
            <select
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">جميع الأنماط</option>
              {DELIVERY_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Fee type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">نوع الرسوم</label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">الكل</option>
              {FEE_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">الترتيب</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">الأحدث</option>
              <option value="most_viewed">الأكثر مشاهدة</option>
              <option value="deadline_soon">الأقرب انتهاءً للتسجيل</option>
            </select>
          </div>

          {/* Registration open checkbox */}
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="registration_open"
              checked={registrationOpen}
              onChange={(e) => setRegistrationOpen(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <label htmlFor="registration_open" className="text-sm text-gray-700 cursor-pointer">
              التسجيل متاح فقط
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleSearch}
          className="bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          تطبيق الفلاتر
        </button>
        {hasFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            مسح الفلاتر
          </button>
        )}
      </div>
    </div>
  )
}
