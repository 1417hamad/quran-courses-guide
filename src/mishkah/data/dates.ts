/** أدوات تواريخ للبيانات التجريبية — تجعل التقويم دائمًا قريبًا من «اليوم» */

const DAY = 86400000

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** تاريخ بصيغة YYYY-MM-DD بعد (أو قبل) عدد من الأيام من اليوم */
export function day(offset: number): string {
  const d = new Date(Date.now() + offset * DAY)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** وقت نسبي مختصر مثل «قبل ساعتين» */
export function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString()
}

export function daysAgo(d: number): string {
  return new Date(Date.now() - d * DAY).toISOString()
}

/** تحويل الأرقام إلى الأرقام العربية الهندية المستخدمة في كامل الواجهة */
function arDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
}

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

const AR_WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

/** 2026-09-18 ← «١٨ سبتمبر ٢٠٢٦» بصيغة عربية مبسطة */
export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  if (Number.isNaN(d.getTime())) return iso
  return `${arDigits(d.getDate())} ${AR_MONTHS[d.getMonth()]} ${arDigits(d.getFullYear())}`
}

export function weekdayOf(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  if (Number.isNaN(d.getTime())) return ''
  return AR_WEEKDAYS[d.getDay()]
}

/** فرق زمني مقروء: «قبل ٣ ساعات» */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diff = Math.max(0, Date.now() - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `قبل ${arDigits(mins)} دقيقة`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours === 1 ? 'قبل ساعة' : hours === 2 ? 'قبل ساعتين' : `قبل ${arDigits(hours)} ساعات`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'أمس'
  if (days < 30) return `قبل ${arDigits(days)} يومًا`
  return formatDate(iso.slice(0, 10))
}

/** هل التاريخ هو اليوم؟ */
export function isToday(iso: string): boolean {
  return iso.slice(0, 10) === day(0)
}

/** هل التاريخ ضمن الأيام السبعة القادمة؟ */
export function isThisWeek(iso: string): boolean {
  const target = new Date(iso.slice(0, 10) + 'T00:00:00').getTime()
  const today = new Date(day(0) + 'T00:00:00').getTime()
  return target >= today && target < today + 7 * DAY
}

/** 13:30 ← «١:٣٠ م» بأرقام عربية ونظام ١٢ ساعة */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  const suffix = h < 12 ? 'ص' : 'م'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const digits = (n: number, pad = false) =>
    String(pad ? String(n).padStart(2, '0') : n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
  return `${digits(hour12)}:${digits(m, true)} ${suffix}`
}
