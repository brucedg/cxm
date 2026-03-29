import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getOAuthUserInfo, findOrCreateOAuthUser } from '@/lib/auth/oauth'
import { createSession, setSessionCookie } from '@/lib/auth/session'

const APP_URL = process.env.APP_URL || 'http://localhost:3008'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_invalid`)
  }

  // Validate state
  const storedState = request.cookies.get('oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_csrf`)
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(provider, code)
    if (!accessToken) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_token`)
    }

    // Get user info from provider
    const userInfo = await getOAuthUserInfo(provider, accessToken)
    if (!userInfo?.email) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_email`)
    }

    // Find or create user
    const userId = await findOrCreateOAuthUser(
      provider, userInfo.id, userInfo.email, userInfo.name, userInfo.avatar
    )

    // Create session
    const sessionId = await createSession(userId, request)

    // Redirect to projects (or 2FA setup if needed)
    const response = NextResponse.redirect(`${APP_URL}/projects`)
    setSessionCookie(response, sessionId)

    // Clear OAuth state cookie
    response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' })

    return response
  } catch (e: any) {
    console.error(`OAuth ${provider} callback error:`, e.message)
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`)
  }
}
