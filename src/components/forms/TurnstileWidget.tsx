'use client'

import { useEffect, useRef, useCallback } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const rendered = useRef(false)

  const renderWidget = useCallback(() => {
    if (containerRef.current && window.turnstile && !rendered.current) {
      rendered.current = true
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: onVerify,
        'expired-callback': () => onExpire?.(),
        theme: 'light',
        language: 'ar',
      })
    }
  }, [onVerify, onExpire])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.turnstile) {
      renderWidget()
    } else {
      window.onTurnstileLoad = renderWidget
    }
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
      }
    }
  }, [renderWidget])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
        strategy="lazyOnload"
      />
      <div ref={containerRef} className="flex justify-center my-2" />
    </>
  )
}
