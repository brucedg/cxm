'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function Verify2FAForm() {
  const params = useSearchParams()
  const router = useRouter()
  const pendingToken = params.get('pending')

  const [code, setCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!pendingToken) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>Invalid session</p>
          <a href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Back to login</a>
        </div>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body: Record<string, string> = { pendingToken }
      if (useRecovery) {
        body.recoveryCode = recoveryCode.trim()
      } else {
        body.code = code
      }

      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/projects')
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
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
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
            Two-factor authentication
          </h2>
          <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {useRecovery
              ? 'Enter one of your recovery codes.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>

          <form onSubmit={submit}>
            {useRecovery ? (
              <input
                type="text"
                value={recoveryCode}
                onChange={e => setRecoveryCode(e.target.value)}
                placeholder="Recovery code"
                autoFocus
                style={{
                  width: '100%', padding: '.75rem 1rem', border: '1px solid #d0d0d0',
                  borderRadius: 10, fontSize: '.95rem', fontFamily: 'monospace',
                  textAlign: 'center', outline: 'none', marginBottom: '1rem',
                }}
              />
            ) : (
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
                style={{
                  width: '100%', padding: '.75rem 1rem', border: '1px solid #d0d0d0',
                  borderRadius: 10, fontSize: '1.3rem', fontFamily: 'monospace',
                  textAlign: 'center', letterSpacing: 8, outline: 'none',
                  marginBottom: '1rem',
                }}
              />
            )}

            {error && <p style={{ color: '#dc2626', fontSize: '.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading || (useRecovery ? !recoveryCode.trim() : code.length !== 6)}
              style={{
                width: '100%', padding: '.8rem', borderRadius: 10, border: 'none',
                background: '#111', color: '#fff', fontSize: '.9rem', fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              onClick={() => { setUseRecovery(!useRecovery); setError('') }}
              style={{
                background: 'none', border: 'none', color: '#2563eb',
                fontSize: '.82rem', fontWeight: 500, cursor: 'pointer',
              }}
            >
              {useRecovery ? 'Use authenticator code instead' : 'Use a recovery code'}
            </button>
          </div>

          <div style={{ borderTop: '1px solid #e8e8e4', marginTop: '1.5rem', paddingTop: '1.5rem', textAlign: 'center' }}>
            <a href="/login" style={{ fontSize: '.82rem', color: '#999', textDecoration: 'none' }}>
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}><p style={{ color: '#666' }}>Loading...</p></div>}>
      <Verify2FAForm />
    </Suspense>
  )
}
