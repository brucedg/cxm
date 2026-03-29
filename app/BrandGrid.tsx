'use client'

import { useState, useEffect, useRef } from 'react'

type Technology = {
  id: number; name: string; svg_logo: string; svg_logo_color: string; color: string
  logo_url: string; url: string; description: string; categories: string[]
}

export function BrandGrid({ techIds }: { techIds?: number[] }) {
  const [techs, setTechs] = useState<Technology[]>([])
  const [hovered, setHovered] = useState<Technology | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/technologies').then(r => r.json()).then((all: Technology[]) => {
      if (techIds && techIds.length > 0) {
        // Preserve the order specified by techIds
        const techMap = new Map(all.map(t => [t.id, t]))
        setTechs(techIds.map(id => techMap.get(id)).filter(Boolean) as Technology[])
      } else {
        setTechs(all)
      }
    }).catch(() => {})
  }, [techIds])

  const showTech = (t: Technology, el: HTMLElement) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    const rect = el.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
    setHovered(t)
  }

  const startHide = () => {
    hideTimer.current = setTimeout(() => setHovered(null), 200)
  }

  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }

  if (techs.length === 0) return null

  return (
    <>
      <div className="v2-clients-strip">
        <p>Featured technology we use</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '16px',
          alignItems: 'center',
          justifyItems: 'center',
        }}>
          {techs.map(t => (
            <div
              key={t.id}
              onMouseEnter={e => {
                const el = e.currentTarget
                showTech(t, el)
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
              {t.svg_logo ? (
                <div
                  style={{ width: 28, height: 28, color: '#fff' }}
                  dangerouslySetInnerHTML={{ __html: t.svg_logo }}
                />
              ) : t.logo_url ? (
                <img src={t.logo_url} alt={t.name} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              ) : null}
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
          }}
        >
          {(hovered.svg_logo_color || hovered.svg_logo) ? (
            <div
              style={{ width: 48, height: 48, margin: '0 auto .75rem', color: hovered.svg_logo_color ? undefined : (hovered.color || '#333') }}
              dangerouslySetInnerHTML={{ __html: hovered.svg_logo_color || hovered.svg_logo }}
            />
          ) : hovered.logo_url ? (
            <img src={hovered.logo_url} alt={hovered.name} style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: '.75rem' }} />
          ) : null}
          <h4 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1rem', fontWeight: 700, marginBottom: '.3rem',
          }}>
            {hovered.name}
          </h4>
          {hovered.categories?.length > 0 && (
            <div style={{ display: 'flex', gap: '.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '.5rem' }}>
              {hovered.categories.map(c => (
                <span key={c} style={{ fontSize: '.68rem', color: '#999', background: '#f4f4f8', padding: '.1rem .4rem', borderRadius: 4 }}>{c}</span>
              ))}
            </div>
          )}
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
              Learn more →
            </a>
          )}
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
