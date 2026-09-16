import type { Metadata } from 'next'
import './mishkah.css'
import { MishkahProvider } from '@/mishkah/store'
import { Shell } from '@/mishkah/components/Shell'
import { brand } from '@/mishkah/brand'

export const metadata: Metadata = {
  title: brand.appName,
  description: `${brand.tagline} — نموذج تفاعلي لمنصة ${brand.orgName} الداخلية.`,
  robots: { index: false, follow: false },
}

export default function MishkahLayout({ children }: { children: React.ReactNode }) {
  return (
    <MishkahProvider>
      <Shell>{children}</Shell>
    </MishkahProvider>
  )
}
