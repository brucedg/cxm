'use client'

import { useState, useEffect } from 'react'

type Brand = { id: number; name: string; logo_url: string; url: string; sort_order: number }

export function BrandGrid() {
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(setBrands).catch(() => {})
  }, [])

  if (brands.length === 0) return null

  return (
    <div className="v2-clients-strip">
      <p>Technologies we work with</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
        gap: '20px',
        alignItems: 'center',
        justifyItems: 'center',
      }}>
        {brands.map(b => {
          const inner = (
            <div
              title={b.name}
              style={{
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.6, transition: 'opacity .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
            >
              <img src={b.logo_url} alt={b.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </div>
          )
          return b.url ? (
            <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
          ) : (
            <div key={b.id}>{inner}</div>
          )
        })}
      </div>
    </div>
  )
}
