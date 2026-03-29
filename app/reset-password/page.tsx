'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const requirements = [
  { label: 'At least 10 characters', test: (p: string) => p.length >= 10 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One digit', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(p) },
]

function ResetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const allMet = requirements.every(r => r.test(password))
  const matches = password === confirm && confirm.length > 0

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allMet || !matches || !token) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDone(true)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>Invalid reset link</p>
          <a href="/forgot-password" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Request a new one</a>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '2rem' }}>
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.75rem' }}>
              Password reset
            </h2>
            <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <a href="/login" style={{
              display: 'inline-block', padding: '.7rem 2rem', borderRadius: 10,
              background: '#111', color: '#fff', fontSize: '.9rem', fontWeight: 600,
              textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Sign in
            </a>
          </div>
        </div>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '.75rem 1rem', border: '1px solid #d0d0d0', borderRadius: 10,
    fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: '.75rem',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '2rem' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#111' }}>
            CX<span style={{ color: '#2563eb' }}>M</span>
          </h1>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>
            New password
          </h2>

          <form onSubmit={submit}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.4rem' }}>
              Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} autoFocus />

            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.4rem' }}>
              Confirm password
            </label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inputStyle} />

            <div style={{ marginBottom: '1.25rem' }}>
              {requirements.map((r, i) => {
                const met = r.test(password)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.25rem' }}>
                    <span style={{ fontSize: '.75rem', color: met ? '#16a34a' : '#d0d0d0' }}>{met ? '●' : '○'}</span>
                    <span style={{ fontSize: '.78rem', color: met ? '#16a34a' : '#999' }}>{r.label}</span>
                  </div>
                )
              })}
              {confirm && !matches && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '.25rem' }}>
                  <span style={{ fontSize: '.75rem', color: '#dc2626' }}>○</span>
                  <span style={{ fontSize: '.78rem', color: '#dc2626' }}>Passwords must match</span>
                </div>
              )}
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading || !allMet || !matches}
              style={{
                width: '100%', padding: '.8rem', borderRadius: 10, border: 'none',
                background: allMet && matches ? '#111' : '#ccc', color: '#fff', fontSize: '.9rem', fontWeight: 600,
                cursor: loading || !allMet || !matches ? 'default' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif", opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}><p style={{ color: '#666' }}>Loading...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
