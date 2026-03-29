'use client'

export default function ProjectsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '2rem' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          <p style={{ fontSize: '2rem', marginBottom: '.75rem' }}>⚠️</p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center' }}>
            <button onClick={reset} style={{ padding: '.6rem 1.5rem', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' }}>
              Try again
            </button>
            <a href="/projects" style={{ padding: '.6rem 1.5rem', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#333', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>
              Back to projects
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
