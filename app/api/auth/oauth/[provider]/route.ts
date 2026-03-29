import { NextRequest, NextResponse } from 'next/server'
import { generateOAuthState, getOAuthRedirectUrl } from '@/lib/auth/oauth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params

  const state = generateOAuthState()
  const url = getOAuthRedirectUrl(provider, state)

  if (!url) {
    return NextResponse.json({ error: `Provider "${provider}" not configured` }, { status: 400 })
  }

  // Store state in a cookie for validation on callback
  const response = NextResponse.redirect(url)
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  })

  return response
}
