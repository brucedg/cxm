'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyForm() {
  const params = useSearchParams()
  const router = useRouter()
  const userId = params.get('userId')
  const token = params.get('token')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('cxm-verify-email')
    if (stored) setEmail(stored)
  }, [])

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-verify if token in URL (from email link click)
  useEffect(() => {
    if (token) {
      verifyWithToken(token)
    }
  }, [token])

  async function verifyWithToken(t: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/create-password?userId=${data.userId}`)
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function verifyWithCode(fullCode: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode, userId: parseInt(userId!) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/create-password?userId=${data.userId}`)
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5) {
      const fullCode = next.join('')
      if (fullCode.length === 6) verifyWithCode(fullCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const next = pasted.split('')
      setCode(next)
      inputRefs.current[5]?.focus()
      verifyWithCode(pasted)
    }
  }

  if (token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
        <div style={{ textAlign: 'center' }}>
          {loading ? (
            <p style={{ color: '#666' }}>Verifying your email...</p>
          ) : error ? (
            <div>
              <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
              <a href="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Try again</a>
            </div>
          ) : null}
        </div>
      </div>
    )
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
            Check your email
          </h2>
          <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            We sent a 6-digit code to <strong style={{ color: '#111' }}>{email}</strong>
          </p>

          <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
                style={{
                  width: 48, height: 56, textAlign: 'center', fontSize: '1.3rem', fontWeight: 700,
                  fontFamily: "monospace", border: '1px solid #d0d0d0', borderRadius: 10,
                  outline: 'none', transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#d0d0d0'}
              />
            ))}
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '.85rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>
          )}

          {loading && (
            <p style={{ color: '#666', fontSize: '.85rem', textAlign: 'center' }}>Verifying...</p>
          )}

          <p style={{ fontSize: '.82rem', color: '#999', textAlign: 'center', marginTop: '1.5rem' }}>
            Didn't receive it?{' '}
            <a href="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Resend code</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}><p style={{ color: '#666' }}>Loading...</p></div>}>
      <VerifyForm />
    </Suspense>
  )
}
