'use client'

import { useState, useEffect, useRef } from 'react'

type Brand = { id: number; name: string; logo_url: string; url: string; description: string; sort_order: number }

export function BrandGrid() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [hovered, setHovered] = useState<Brand | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(setBrands).catch(() => {})
  }, [])

  const showBrand = (b: Brand, el: HTMLElement) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    const rect = el.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
    setHovered(b)
  }

  const startHide = () => {
    hideTimer.current = setTimeout(() => setHovered(null), 200)
  }

  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }

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
              onMouseEnter={e => {
                const el = e.currentTarget
                showBrand(b, el)
                el.style.background = 'rgba(255,255,255,.15)'
                el.style.borderColor = 'rgba(255,255,255,.15)'
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,.15)'
              }}
              onMouseLeave={e => {
                startHide()
                const el = e.currentTarget
                el.style.background = 'rgba(255,255,255,.1)'
                el.style.borderColor = 'transparent'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
              style={{
                width: 56, height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10,
                background: 'rgba(255,255,255,.1)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              <img src={b.logo_url} alt={b.name} style={{ width: 32, height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Hover popover */}
      {hovered && (
        <div
          onMouseEnter={cancelHide}
          onMouseLeave={startHide}
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y - 12,
            transform: 'translate(-50%, -100%)',
            background: '#fff',
            borderRadius: 14,
            padding: '1.25rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,.2)',
            zIndex: 10000,
            minWidth: 220,
            maxWidth: 300,
            pointerEvents: 'auto',
            transition: 'opacity .15s',
          }}
        >
          <img
            src={hovered.logo_url}
            alt={hovered.name}
            style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: '.75rem' }}
          />
          <h4 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1rem', fontWeight: 700, marginBottom: '.3rem',
          }}>
            {hovered.name}
          </h4>
          {hovered.description && (
            <p style={{ fontSize: '.82rem', color: '#666', lineHeight: 1.5, marginBottom: '.75rem' }}>
              {hovered.description}
            </p>
          )}
          {hovered.url && (
            <a
              href={hovered.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', fontSize: '.78rem', color: '#2563eb',
                textDecoration: 'none', fontWeight: 600,
              }}
            >
              Find out more about {hovered.name} →
            </a>
          )}
          {/* Arrow */}
          <div style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
            width: 12, height: 12, background: '#fff',
            boxShadow: '3px 3px 4px rgba(0,0,0,.05)',
          }} />
        </div>
      )}
    </>
  )
}
