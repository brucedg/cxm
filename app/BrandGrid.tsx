'use client'

import { useState, useEffect } from 'react'

type Brand = { id: number; name: string; logo_url: string; url: string; description: string; sort_order: number }

export function BrandGrid() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selected, setSelected] = useState<Brand | null>(null)

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(setBrands).catch(() => {})
  }, [])

  if (brands.length === 0) return null

  return (
    <>
      <div className="v2-clients-strip">
        <p>Technologies we work with</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
          gap: '16px',
          alignItems: 'center',
          justifyItems: 'center',
        }}>
          {brands.map(b => (
            <div
              key={b.id}
              onClick={() => setSelected(b)}
              style={{
                width: 56, height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10,
                background: 'rgba(255,255,255,.06)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,.12)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,.06)'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <img src={b.logo_url} alt={b.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Brand detail modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, padding: '2.5rem',
              maxWidth: 360, width: '90%', textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,.2)',
            }}
          >
            <img
              src={selected.logo_url}
              alt={selected.name}
              style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: '1.25rem' }}
            />
            <h3 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.3rem', fontWeight: 700, marginBottom: '.5rem',
            }}>
              {selected.name}
            </h3>
            {selected.description && (
              <p style={{ fontSize: '.9rem', color: '#666', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {selected.description}
              </p>
            )}
            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', fontSize: '.82rem', color: '#2563eb',
                  textDecoration: 'none', fontWeight: 600,
                }}
              >
                Visit website →
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}
