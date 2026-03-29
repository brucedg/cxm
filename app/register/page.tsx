'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OAuthButtons } from '@/components/OAuthButtons'
import { trackEvent } from '@/lib/analytics'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      trackEvent('registration_started')
      sessionStorage.setItem('cxm-verify-email', email)
      router.push(`/verify?userId=${data.userId}`)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
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
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
            Get started
          </h2>
          <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Enter your email to create an account and start building your technology stack.
          </p>

          <form onSubmit={submit}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.4rem' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
              style={{
                width: '100%', padding: '.75rem 1rem', border: '1px solid #d0d0d0', borderRadius: 10,
                fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: '1rem',
                transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d0d0d0'}
            />

            {error && (
              <p style={{ color: '#dc2626', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%', padding: '.8rem', borderRadius: 10, border: 'none',
                background: '#111', color: '#fff', fontSize: '.9rem', fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '.5px',
                transition: 'opacity .2s',
              }}
            >
              {loading ? 'Sending...' : 'Continue with email'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
            <span style={{ fontSize: '.78rem', color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
          </div>

          <OAuthButtons />

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '.82rem', color: '#999' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
