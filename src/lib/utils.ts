import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function isRegistrationOpen(deadline: string): boolean {
  return new Date(deadline) > new Date()
}

export function isProgramEnded(endDate: string): boolean {
  return new Date(endDate) < new Date()
}

export function generateSlug(title: string, id: string): string {
  const arabicToLatin = (str: string) =>
    str
      .replace(/[ء-ي٠-٩]/g, (char) => {
        const code = char.charCodeAt(0)
        if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660)
        return char
      })
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  const slugPart = arabicToLatin(title).slice(0, 50) || 'program'
  const idPart = id.split('-')[0]
  return `${slugPart}-${idPart}`
}

export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }
      return map[char]
    })
    .trim()
}

export function validateSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '')
  return /^(05|5|\+9665|009665)\d{8}$/.test(cleaned)
}

export function validateRegistrationUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export function validateMapsUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      ['http:', 'https:'].includes(parsed.protocol) &&
      (parsed.hostname.includes('google.com') ||
        parsed.hostname.includes('maps.app.goo.gl') ||
        parsed.hostname.includes('goo.gl'))
    )
  } catch {
    return false
  }
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const phoneWithCode = cleaned.startsWith('0')
    ? `966${cleaned.slice(1)}`
    : cleaned.startsWith('966')
      ? cleaned
      : `966${cleaned}`
  const encodedMsg = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${phoneWithCode}${encodedMsg ? `?text=${encodedMsg}` : ''}`
}

export function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}م`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}ك`
  return count.toString()
}

export function getProgramShareText(title: string, organization: string, url: string): string {
  return `${title}\n${organization}\n\nشاهد التفاصيل وسجّل من خلال الرابط:\n${url}`
}
