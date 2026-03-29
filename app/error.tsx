'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', fontFamily: "'DM Sans', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#111', marginBottom: '1.5rem' }}>
            CX<span style={{ color: '#2563eb' }}>M</span>
          </h1>
          <p style={{ fontSize: '2rem', marginBottom: '.75rem' }}>⚠️</p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#666', fontSize: '.85rem', marginBottom: '1.5rem' }}>{error.message || 'An unexpected error occurred.'}</p>
          <button onClick={reset} style={{ padding: '.6rem 1.5rem', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
