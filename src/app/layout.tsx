import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'sonner'

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-arabic',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://quran-courses.vercel.app'),
  title: {
    default: 'دليل الدورات القرآنية | الدورات القرآنية في المملكة العربية السعودية',
    template: '%s | دليل الدورات القرآنية',
  },
  description:
    'دليل شامل للدورات والبرامج القرآنية في جميع مناطق المملكة العربية السعودية. ابحث وتصفح وسجّل في الدورات القرآنية المناسبة لك.',
  keywords: ['دورات قرآنية', 'تحفيظ القرآن', 'تجويد', 'المملكة العربية السعودية', 'حلقات قرآنية'],
  authors: [{ name: 'دليل الدورات القرآنية' }],
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'دليل الدورات القرآنية',
    title: 'دليل الدورات القرآنية',
    description: 'دليل شامل للدورات والبرامج القرآنية في المملكة العربية السعودية',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دليل الدورات القرآنية',
    description: 'دليل شامل للدورات والبرامج القرآنية في المملكة العربية السعودية',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlex.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50 font-[family-name:var(--font-arabic)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors dir="rtl" />
      </body>
    </html>
  )
}
