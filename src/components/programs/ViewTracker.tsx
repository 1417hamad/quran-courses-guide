'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  programId: string
}

export function ViewTracker({ programId }: ViewTrackerProps) {
  useEffect(() => {
    const track = async () => {
      try {
        await fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ program_id: programId }),
        })
      } catch {
        // Silent fail — view tracking is non-critical
      }
    }

    track()
  }, [programId])

  return null
}
