export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', fontFamily: "'DM Sans', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#111', marginBottom: '2rem' }}>
            CX<span style={{ color: '#2563eb' }}>M</span>
          </h1>
          <p style={{ fontSize: '4rem', marginBottom: '.5rem', opacity: 0.3 }}>404</p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
            Page not found
          </h2>
          <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <a href="/" style={{
            display: 'inline-block', padding: '.7rem 2rem', borderRadius: 10,
            background: '#111', color: '#fff', fontSize: '.9rem', fontWeight: 600,
            textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
