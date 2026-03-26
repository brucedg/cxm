'use client'

export function AdminHeader({ breadcrumb }: { breadcrumb: string }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '.4rem' }}>Admin</h2>
      <div style={{ fontSize: '.82rem', color: '#999' }}>
        <a href="/admin" style={{ color: '#999', textDecoration: 'none' }}>Admin</a>
        <span style={{ margin: '0 .4rem' }}>›</span>
        <span style={{ color: '#555' }}>{breadcrumb}</span>
      </div>
    </div>
  )
}
