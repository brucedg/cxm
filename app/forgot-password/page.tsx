'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }
      setSent(true)
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
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.75rem' }}>
                Check your email
              </h2>
              <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                If an account exists for <strong style={{ color: '#111' }}>{email}</strong>, we've sent a password reset link.
              </p>
              <a href="/login" style={{
                display: 'inline-block', padding: '.7rem 2rem', borderRadius: 10, border: 'none',
                background: '#111', color: '#fff', fontSize: '.9rem', fontWeight: 600,
                textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif",
              }}>
                Back to sign in
              </a>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
                Reset password
              </h2>
              <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Enter your email and we'll send you a reset link.
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
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a href="/login" style={{ fontSize: '.82rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                  Back to sign in
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
