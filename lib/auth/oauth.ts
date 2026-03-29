import crypto from 'crypto'
import { getDb } from '@/lib/db'

const APP_URL = process.env.APP_URL || 'http://localhost:3008'

// --- State management (CSRF protection for OAuth) ---

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex')
}

// --- Provider configs ---

type OAuthProvider = {
  authUrl: string
  tokenUrl: string
  userInfoUrl?: string
  clientId: string
  clientSecret: string
  scopes: string[]
}

function getProviderConfig(provider: string): OAuthProvider | null {
  switch (provider) {
    case 'google':
      return {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        scopes: ['openid', 'email', 'profile'],
      }
    case 'github':
      return {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        scopes: ['read:user', 'user:email'],
      }
    case 'apple':
      return {
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
        clientId: process.env.APPLE_CLIENT_ID || '',
        clientSecret: process.env.APPLE_CLIENT_SECRET || '',
        scopes: ['name', 'email'],
      }
    case 'vercel':
      return {
        authUrl: 'https://vercel.com/integrations/oauth-authorize',
        tokenUrl: 'https://api.vercel.com/v2/oauth/access_token',
        userInfoUrl: 'https://api.vercel.com/v2/user',
        clientId: process.env.VERCEL_CLIENT_ID || '',
        clientSecret: process.env.VERCEL_CLIENT_SECRET || '',
        scopes: ['user:read'],
      }
    default:
      return null
  }
}

export function getOAuthRedirectUrl(provider: string, state: string): string | null {
  const config = getProviderConfig(provider)
  if (!config || !config.clientId) return null

  const redirectUri = `${APP_URL}/api/auth/oauth/callback/${provider}`
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  })

  // Provider-specific params
  if (provider === 'google') {
    params.set('access_type', 'offline')
    params.set('prompt', 'select_account')
  }
  if (provider === 'apple') {
    params.set('response_mode', 'form_post')
  }

  return `${config.authUrl}?${params.toString()}`
}

export async function exchangeCodeForToken(provider: string, code: string): Promise<string | null> {
  const config = getProviderConfig(provider)
  if (!config) return null

  const redirectUri = `${APP_URL}/api/auth/oauth/callback/${provider}`

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

  const data = await res.json()
  return data.access_token || null
}

type OAuthUserInfo = {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

export async function getOAuthUserInfo(provider: string, accessToken: string): Promise<OAuthUserInfo | null> {
  const config = getProviderConfig(provider)
  if (!config?.userInfoUrl) return null

  const res = await fetch(config.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })

  if (!res.ok) return null
  const data = await res.json()

  switch (provider) {
    case 'google':
      return { id: data.id, email: data.email, name: data.name, avatar: data.picture }
    case 'github': {
      let email = data.email
      if (!email) {
        // GitHub may not return email in profile — fetch from emails endpoint
        const emailRes = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
        })
        if (emailRes.ok) {
          const emails = await emailRes.json()
          const primary = emails.find((e: any) => e.primary && e.verified)
          email = primary?.email || emails[0]?.email
        }
      }
      return { id: String(data.id), email, name: data.name || data.login, avatar: data.avatar_url }
    }
    case 'vercel':
      return { id: data.user?.id || data.id, email: data.user?.email || data.email, name: data.user?.name || data.name, avatar: data.user?.avatar || data.avatar }
    default:
      return null
  }
}

export async function findOrCreateOAuthUser(
  provider: string,
  oauthId: string,
  email: string,
  name: string | null,
  avatar: string | null
): Promise<number> {
  const sql = getDb()

  // Check if OAuth account already linked
  const [existing] = await sql`
    SELECT id FROM users WHERE oauth_provider = ${provider} AND oauth_id = ${oauthId}
  `
  if (existing) {
    // Update last login info
    await sql`
      UPDATE users SET
        last_login_at = NOW(),
        display_name = COALESCE(display_name, ${name}),
        avatar_url = COALESCE(avatar_url, ${avatar})
      WHERE id = ${existing.id}
    `
    return existing.id
  }

  // Check if email already exists (merge accounts)
  const normalizedEmail = email.toLowerCase().trim()
  const [byEmail] = await sql`SELECT id FROM users WHERE email = ${normalizedEmail}`
  if (byEmail) {
    // Link OAuth to existing account
    await sql`
      UPDATE users SET
        oauth_provider = ${provider},
        oauth_id = ${oauthId},
        email_verified = true,
        display_name = COALESCE(display_name, ${name}),
        avatar_url = COALESCE(avatar_url, ${avatar}),
        last_login_at = NOW()
      WHERE id = ${byEmail.id}
    `
    return byEmail.id
  }

  // Create new user
  const [newUser] = await sql`
    INSERT INTO users (email, email_verified, oauth_provider, oauth_id, display_name, avatar_url, last_login_at)
    VALUES (${normalizedEmail}, true, ${provider}, ${oauthId}, ${name}, ${avatar}, NOW())
    RETURNING id
  `
  return newUser.id
}
