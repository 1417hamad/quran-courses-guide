export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  // In development, allow bypass with test token
  if (process.env.NODE_ENV === 'development' && token === 'dev-bypass') {
    return true
  }

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY not configured')
    return false
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: token,
        }),
      }
    )

    const data = await response.json()
    return data.success === true
  } catch {
    return false
  }
}
