'use client'

import { Share2, Copy, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getWhatsAppUrl, getProgramShareText } from '@/lib/utils'

interface ShareButtonsProps {
  url: string
  title: string
  organization: string
}

export function ShareButtons({ url, title, organization }: ShareButtonsProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('تم نسخ الرابط')
    } catch {
      toast.error('تعذر نسخ الرابط')
    }
  }

  const handleWhatsAppShare = () => {
    const text = getProgramShareText(title, organization, url)
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 mb-2">مشاركة الدورة</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 text-green-700 py-2 rounded-lg text-sm hover:bg-green-100 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          واتساب
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          نسخ الرابط
        </button>
      </div>
    </div>
  )
}
