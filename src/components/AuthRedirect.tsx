'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      router.push('/auth/update-password' + hash)
    }
  }, [router])

  return null
}
