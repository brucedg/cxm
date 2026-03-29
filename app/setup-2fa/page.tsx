'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'

type Step = 'scan' | 'verify' | 'recovery'

export default function Setup2FAPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('scan')
  const [uri, setUri] = useState('')
  const [secret, setSecret] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetch('/api/auth/setup-2fa')
      .then(r => r.json())
      .then(async data => {
        if (data.error) { router.push('/login'); return }
        setUri(data.uri)
        setSecret(data.secret)
        const url = await QRCode.toDataURL(data.uri, { width: 240, margin: 2 })
        setQrDataUrl(url)
      })
      .catch(() => router.push('/login'))
  }, [router])

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, secret }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setRecoveryCodes(data.recoveryCodes)
      setStep('recovery')
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const copyRecoveryCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 16, padding: '2.5rem',
    border: '1px solid #e8e8e4', maxWidth: 420, width: '100%',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '2rem' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#111' }}>
            CX<span style={{ color: '#2563eb' }}>M</span>
          </h1>
        </div>

        {step === 'scan' && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
              Set up 2FA
            </h2>
            <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
            </p>

            {qrDataUrl && (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img src={qrDataUrl} alt="2FA QR Code" style={{ borderRadius: 12, border: '1px solid #e8e8e4' }} />
              </div>
            )}

            <details style={{ marginBottom: '1.5rem' }}>
              <summary style={{ fontSize: '.82rem', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>
                Can't scan? Enter manually
              </summary>
              <div style={{
                marginTop: '.75rem', padding: '.75rem', background: '#f4f4f8',
                borderRadius: 8, fontFamily: 'monospace', fontSize: '.78rem',
                wordBreak: 'break-all', color: '#333',
              }}>
                {secret}
              </div>
            </details>

            <button
              onClick={() => setStep('verify')}
              style={{
                width: '100%', padding: '.8rem', borderRadius: 10, border: 'none',
                background: '#111', color: '#fff', fontSize: '.9rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              I've scanned it
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
              Verify setup
            </h2>
            <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Enter the 6-digit code from your authenticator app to confirm setup.
            </p>

            <form onSubmit={verify}>
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

              {error && <p style={{ color: '#dc2626', fontSize: '.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%', padding: '.8rem', borderRadius: 10, border: 'none',
                  background: code.length === 6 ? '#111' : '#ccc', color: '#fff',
                  fontSize: '.9rem', fontWeight: 600, cursor: code.length === 6 ? 'pointer' : 'default',
                  fontFamily: "'Space Grotesk', sans-serif", opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </form>

            <button
              onClick={() => setStep('scan')}
              style={{
                width: '100%', marginTop: '.75rem', padding: '.5rem', border: 'none',
                background: 'none', color: '#2563eb', fontSize: '.82rem', fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Back to QR code
            </button>
          </div>
        )}

        {step === 'recovery' && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
              Recovery codes
            </h2>
            <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Save these codes somewhere safe. Each can be used once if you lose access to your authenticator.
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem',
              padding: '1rem', background: '#f4f4f8', borderRadius: 10, marginBottom: '1rem',
            }}>
              {recoveryCodes.map((c, i) => (
                <code key={i} style={{ fontFamily: 'monospace', fontSize: '.88rem', padding: '.3rem .5rem', color: '#333' }}>
                  {c}
                </code>
              ))}
            </div>

            <button
              onClick={copyRecoveryCodes}
              style={{
                width: '100%', padding: '.6rem', borderRadius: 10, border: '1px solid #d0d0d0',
                background: '#fff', color: '#333', fontSize: '.85rem', fontWeight: 600,
                cursor: 'pointer', marginBottom: '1rem',
              }}
            >
              {copied ? 'Copied!' : 'Copy codes'}
            </button>

            <button
              onClick={() => router.push('/projects')}
              style={{
                width: '100%', padding: '.8rem', borderRadius: 10, border: 'none',
                background: '#111', color: '#fff', fontSize: '.9rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Done — go to projects
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
