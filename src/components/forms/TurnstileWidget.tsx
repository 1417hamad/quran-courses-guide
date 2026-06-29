'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    onTurnstileSuccess?: (token: string) => void
    onTurnstileExpired?: () => void
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  useEffect(() => {
    window.onTurnstileSuccess = onVerify
    window.onTurnstileExpired = onExpire
    return () => {
      delete window.onTurnstileSuccess
      delete window.onTurnstileExpired
    }
  }, [onVerify, onExpire])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile flex justify-center"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        data-callback="onTurnstileSuccess"
        data-expired-callback="onTurnstileExpired"
        data-theme="light"
        data-language="ar"
      />
    </>
  )
}
