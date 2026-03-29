'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { trackEvent } from '@/lib/analytics'

type Technology = {
  id: number; name: string; svg_logo: string; svg_logo_color: string; color: string
  logo_url: string; url: string; description: string; categories: string[]
}

type Tab = 'ours' | 'yours'

export function BrandGrid({ techIds }: { techIds?: number[] }) {
  const [allTechs, setAllTechs] = useState<Technology[]>([])
  const [ourTechs, setOurTechs] = useState<Technology[]>([])
  const [yourTechs, setYourTechs] = useState<Technology[]>([])
  const [tab, setTab] = useState<Tab>('ours')
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<Technology | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/technologies').then(r => r.json()).then((all: Technology[]) => {
      setAllTechs(all)
      if (techIds && techIds.length > 0) {
        const techMap = new Map(all.map(t => [t.id, t]))
        setOurTechs(techIds.map(id => techMap.get(id)).filter(Boolean) as Technology[])
      } else {
        setOurTechs(all)
      }
      // Restore user's tech from localStorage
      try {
        const stored = localStorage.getItem('cxm-your-tech')
        if (stored) {
          const ids: number[] = JSON.parse(stored)
          const techMap = new Map(all.map(t => [t.id, t]))
          setYourTechs(ids.map(id => techMap.get(id)).filter(Boolean) as Technology[])
        }
      } catch { /* ignore */ }
    }).catch(() => {})
  }, [techIds])

  // Persist user's tech to localStorage
  useEffect(() => {
    if (yourTechs.length > 0) {
      localStorage.setItem('cxm-your-tech', JSON.stringify(yourTechs.map(t => t.id)))
    }
  }, [yourTechs])

  const addToYours = useCallback((tech: Technology) => {
    if (yourTechs.some(t => t.id === tech.id)) return
    setYourTechs(prev => [...prev, tech])
    setSearch('')
    trackEvent('your_tech_added', { tech_name: tech.name })
  }, [yourTechs])

  const removeFromYours = useCallback((id: number) => {
    setYourTechs(prev => prev.filter(t => t.id !== id))
  }, [])

  const showTech = (t: Technology, el: HTMLElement) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    const rect = el.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
    setHovered(t)
  }

  const startHide = () => { hideTimer.current = setTimeout(() => setHovered(null), 200) }
  const cancelHide = () => { if (hideTimer.current) clearTimeout(hideTimer.current) }

  // Search results — filter techs not already in yourTechs
  const yourIds = new Set(yourTechs.map(t => t.id))
  const searchResults = search.trim()
    ? allTechs.filter(t => {
        if (yourIds.has(t.id)) return false
        const q = search.toLowerCase()
        return t.name.toLowerCase().includes(q) || (t.categories || []).some(c => c.toLowerCase().includes(q))
      }).slice(0, 12)
    : []

  const activeTechs = tab === 'ours' ? ourTechs : yourTechs

  if (ourTechs.length === 0 && allTechs.length === 0) return null

  const renderIcon = (t: Technology, onClick?: () => void, showRemove?: boolean) => (
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
      onClick={onClick}
      style={{
        width: 56, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 10,
        background: 'rgba(255,255,255,.1)',
        border: '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all .2s',
        position: 'relative',
      }}
    >
      {t.svg_logo ? (
        <div style={{ width: 28, height: 28, color: '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
      ) : t.logo_url ? (
        <img src={t.logo_url} alt={t.name} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
      ) : null}
      {showRemove && (
        <button
          onClick={e => { e.stopPropagation(); removeFromYours(t.id) }}
          style={{
            position: 'absolute', top: -6, right: -6,
            width: 18, height: 18, borderRadius: '50%',
            background: 'rgba(220,38,38,.85)', border: 'none', color: '#fff',
            fontSize: '.65rem', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          }}
        >✕</button>
      )}
    </div>
  )

  return (
    <>
      <div className="v2-clients-strip">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1rem' }}>
          <button
            onClick={() => setTab('ours')}
            style={{
              padding: '.4rem 1.2rem', border: 'none', cursor: 'pointer',
              borderRadius: '6px 0 0 6px',
              background: tab === 'ours' ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.06)',
              color: tab === 'ours' ? '#fff' : 'rgba(255,255,255,.5)',
              fontSize: '.78rem', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '.5px', transition: 'all .2s',
            }}
          >
            Our Technology
          </button>
          <button
            onClick={() => setTab('yours')}
            style={{
              padding: '.4rem 1.2rem', border: 'none', cursor: 'pointer',
              borderRadius: '0 6px 6px 0',
              background: tab === 'yours' ? 'rgba(37,99,235,.6)' : 'rgba(255,255,255,.06)',
              color: tab === 'yours' ? '#fff' : 'rgba(255,255,255,.5)',
              fontSize: '.78rem', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '.5px', transition: 'all .2s',
            }}
          >
            Your Technology {yourTechs.length > 0 && `(${yourTechs.length})`}
          </button>
        </div>

        {/* Search (only on Your tab) */}
        {tab === 'yours' && (
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search technologies to add..."
              style={{
                width: '100%', padding: '.5rem .75rem', borderRadius: 8,
                border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)',
                color: '#fff', fontSize: '.82rem', outline: 'none', fontFamily: 'inherit',
              }}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: '#1a1a2e', border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 10, marginTop: 4, maxHeight: 240, overflowY: 'auto',
                boxShadow: '0 8px 30px rgba(0,0,0,.4)',
              }}>
                {searchResults.map(t => (
                  <button
                    key={t.id}
                    onClick={() => addToYours(t)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '.5rem',
                      width: '100%', padding: '.5rem .75rem', border: 'none',
                      background: 'transparent', color: '#fff', cursor: 'pointer',
                      textAlign: 'left', fontSize: '.82rem', transition: 'background .1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {t.svg_logo ? (
                      <div style={{ width: 22, height: 22, flexShrink: 0, color: t.color || '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
                    ) : (
                      <div style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 4, background: 'rgba(255,255,255,.1)' }} />
                    )}
                    <span style={{ fontWeight: 500 }}>{t.name}</span>
                    <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.4)', marginLeft: 'auto' }}>
                      {(t.categories || []).slice(0, 2).join(', ')}
                    </span>
                    <span style={{ fontSize: '.75rem', color: 'rgba(37,99,235,.8)', fontWeight: 600 }}>+</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        {activeTechs.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '16px',
            alignItems: 'center',
            justifyItems: 'center',
          }}>
            {activeTechs.map(t => renderIcon(t, undefined, tab === 'yours'))}
          </div>
        ) : tab === 'yours' ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.85rem' }}>
              Search above to add technologies you use
            </p>
          </div>
        ) : null}

        {/* Send query button (Your tab with selections) */}
        {tab === 'yours' && yourTechs.length > 0 && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => {
                trackEvent('your_tech_submitted', { tech_count: yourTechs.length, techs: yourTechs.map(t => t.name).join(', ') })
                const subject = encodeURIComponent('Technology Stack Consultation')
                const body = encodeURIComponent(`Hi CXM,\n\nI'd like to discuss my technology stack:\n\n${yourTechs.map(t => `• ${t.name} (${(t.categories || []).join(', ')})`).join('\n')}\n\nPlease get in touch to discuss how you can help.`)
                window.location.href = `mailto:hello@cxm.nz?subject=${subject}&body=${body}`
              }}
              style={{
                padding: '.5rem 1.5rem', borderRadius: 8, border: 'none',
                background: '#2563eb', color: '#fff', fontSize: '.82rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
                transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
            >
              Talk to us about your stack →
            </button>
          </div>
        )}
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
          {tab === 'yours' && !yourIds.has(hovered.id) && (
            <button
              onClick={() => { addToYours(hovered); setHovered(null) }}
              style={{
                display: 'block', width: '100%', marginTop: '.75rem',
                padding: '.4rem', borderRadius: 6, border: 'none',
                background: '#2563eb', color: '#fff', fontSize: '.78rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              + Add to your stack
            </button>
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
