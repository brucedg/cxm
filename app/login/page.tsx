'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OAuthButtons } from '@/components/OAuthButtons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email first. Check your inbox.')
        } else {
          setError(data.error)
        }
        return
      }
      if (data.requires2FA) {
        router.push(`/verify-2fa?pending=${data.pendingToken}`)
        return
      }
      router.push('/projects')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '.75rem 1rem', border: '1px solid #d0d0d0', borderRadius: 10,
    fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: '.75rem',
    transition: 'border-color .2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: 1,
    textTransform: 'uppercase', color: '#555', marginBottom: '.4rem',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '2rem' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#111', marginBottom: '.5rem' }}>
            CX<span style={{ color: '#2563eb' }}>M</span>
          </h1>
          <p style={{ color: '#999', fontSize: '.85rem' }}>Project Builder</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>
            Sign in
          </h2>

          <form onSubmit={submit}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d0d0d0'}
            />

            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d0d0d0'}
            />

            {error && (
              <p style={{ color: '#dc2626', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '.8rem', borderRadius: 10, border: 'none',
                background: '#111', color: '#fff', fontSize: '.9rem', fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '.5px',
                transition: 'opacity .2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <a href="/forgot-password" style={{ fontSize: '.82rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              Forgot password?
            </a>
            <button
              onClick={async () => {
                if (!email.trim()) { setError('Enter your email first'); return }
                setMagicLoading(true); setError('')
                try {
                  await fetch('/api/auth/magic-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  })
                  setMagicSent(true)
                } catch { setError('Failed to send link') }
                setMagicLoading(false)
              }}
              disabled={magicLoading}
              style={{ background: 'none', border: 'none', fontSize: '.82rem', color: '#2563eb', fontWeight: 500, cursor: 'pointer' }}
            >
              {magicLoading ? 'Sending...' : magicSent ? 'Link sent!' : 'Email me a login link'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
            <span style={{ fontSize: '.78rem', color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
          </div>

          <OAuthButtons />

          <div style={{ borderTop: '1px solid #e8e8e4', marginTop: '1.5rem', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '.82rem', color: '#999' }}>
              Don't have an account?{' '}
              <a href="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
