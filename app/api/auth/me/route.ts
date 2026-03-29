import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      displayName: session.displayName,
      avatarUrl: session.avatarUrl,
      totpEnabled: session.totpEnabled,
    },
  })
}
