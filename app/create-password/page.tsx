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

function CreatePasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const userId = params.get('userId')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const allMet = requirements.every(r => r.test(password))
  const matches = password === confirm && confirm.length > 0

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allMet || !matches) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId!), password, displayName }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/setup-2fa')
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '2rem' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#111', marginBottom: '.5rem' }}>
            CX<span style={{ color: '#2563eb' }}>M</span>
          </h1>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
            Create your password
          </h2>
          <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Set up a secure password for your account.
          </p>

          <form onSubmit={submit}>
            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.4rem' }}>
              Display name (optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="How should we address you?"
              style={inputStyle}
            />

            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.4rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              autoFocus
            />

            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.4rem' }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={inputStyle}
            />

            {/* Requirements checklist */}
            <div style={{ marginBottom: '1.25rem' }}>
              {requirements.map((r, i) => {
                const met = r.test(password)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.25rem' }}>
                    <span style={{ fontSize: '.75rem', color: met ? '#16a34a' : '#d0d0d0', transition: 'color .2s' }}>
                      {met ? '●' : '○'}
                    </span>
                    <span style={{ fontSize: '.78rem', color: met ? '#16a34a' : '#999', transition: 'color .2s' }}>
                      {r.label}
                    </span>
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

            {error && (
              <p style={{ color: '#dc2626', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !allMet || !matches}
              style={{
                width: '100%', padding: '.8rem', borderRadius: 10, border: 'none',
                background: allMet && matches ? '#111' : '#ccc', color: '#fff', fontSize: '.9rem', fontWeight: 600,
                cursor: loading || !allMet || !matches ? 'default' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '.5px',
                transition: 'background .2s, opacity .2s', opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}><p style={{ color: '#666' }}>Loading...</p></div>}>
      <CreatePasswordForm />
    </Suspense>
  )
}
