'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyEmailToken } from '@/lib/auth/tokens'

function MagicLoginHandler() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setError('Invalid login link'); setLoading(false); return }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'magic_link' }),
    })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) { setError(data.error || 'Invalid or expired link'); setLoading(false); return }

        // Now create a session — call a dedicated magic login endpoint
        const loginRes = await fetch('/api/auth/magic-link-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const loginData = await loginRes.json()
        if (loginData.requires2FA) {
          router.push(`/verify-2fa?pending=${loginData.pendingToken}`)
        } else if (loginData.success) {
          router.push('/projects')
        } else {
          setError(loginData.error || 'Login failed')
          setLoading(false)
        }
      })
      .catch(() => { setError('Login failed'); setLoading(false) })
  }, [token, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
      <div style={{ textAlign: 'center' }}>
        {loading ? (
          <p style={{ color: '#666' }}>Signing you in...</p>
        ) : error ? (
          <div>
            <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
            <a href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Back to login</a>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function MagicLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}><p style={{ color: '#666' }}>Loading...</p></div>}>
      <MagicLoginHandler />
    </Suspense>
  )
}
