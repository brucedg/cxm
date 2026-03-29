'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { trackEvent } from '@/lib/analytics'

type Technology = {
  id: number; name: string; svg_logo: string; svg_logo_color: string; color: string
  logo_url: string; url: string; description: string; categories: string[]
}

export function BrandGrid({ techIds }: { techIds?: number[] }) {
  const [techs, setTechs] = useState<Technology[]>([])
  const [allTechs, setAllTechs] = useState<Technology[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [flash, setFlash] = useState<{ id: number; action: 'added' | 'removed'; x: number; y: number } | null>(null)
  const [hovered, setHovered] = useState<Technology | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/technologies').then(r => r.json()).then((all: Technology[]) => {
      setAllTechs(all)
      if (techIds && techIds.length > 0) {
        const techMap = new Map(all.map(t => [t.id, t]))
        setTechs(techIds.map(id => techMap.get(id)).filter(Boolean) as Technology[])
      } else {
        setTechs(all)
      }
      // Restore user's selections from localStorage (no pre-selection)
      try {
        const stored = localStorage.getItem('cxm-your-tech')
        if (stored) setSelected(new Set(JSON.parse(stored)))
      } catch { /* ignore */ }
    }).catch(() => {})
  }, [techIds])

  // Persist selections once user interacts
  const hasEdited = useRef(false)
  useEffect(() => {
    if (!hasEdited.current) return
    localStorage.setItem('cxm-your-tech', JSON.stringify([...selected]))
  }, [selected])

  const toggle = useCallback((tech: Technology, x?: number, y?: number) => {
    hasEdited.current = true
    const wasSelected = selected.has(tech.id)
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(tech.id)) {
        next.delete(tech.id)
      } else {
        next.add(tech.id)
        trackEvent('your_tech_added', { tech_name: tech.name })
      }
      return next
    })
    setFlash({ id: tech.id, action: wasSelected ? 'removed' : 'added', x: x || 0, y: y || 0 })
    setTimeout(() => setFlash(null), 1200)
    if (!wasSelected && search.trim()) setSearch('')
  }, [selected, search])

  const showTech = (t: Technology) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setHovered(t)
  }

  const startHide = () => { hideTimer.current = setTimeout(() => setHovered(null), 300) }

  // Check if a hex colour is too dark to show on dark background
  const isTooLight = (hex: string) => {
    if (!hex || !hex.startsWith('#')) return false
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    // Relative luminance — below 0.15 is too dark for dark bg
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.85
  }
  const isDark = (hex: string) => {
    if (!hex || !hex.startsWith('#')) return true
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance < 0.25
  }

  const selectedTechs = techs.filter(t => selected.has(t.id))

  if (techs.length === 0) return null

  return (
    <>
      <div className="v2-clients-strip" style={{ minWidth: 0, width: '100%', position: 'relative', contain: 'layout style' }}>
        {/* Toast confirmation — follows cursor */}
        {flash && (
          <div style={{
            position: 'fixed', left: flash.x + 12, top: flash.y + 12, zIndex: 20,
            opacity: flash ? 1 : 0,
            transition: 'opacity .3s ease-in-out',
            pointerEvents: 'none',
          }}>
            <span style={{
              color: 'rgba(255,255,255,.8)',
              fontSize: '.72rem', fontWeight: 500,
              fontFamily: "'Space Grotesk', sans-serif",
              whiteSpace: 'nowrap',
            }}>
              {flash.action === 'added' ? '✓ Added' : '✕ Removed'}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <p style={{ margin: 0, whiteSpace: 'nowrap' }}>Choose Your Tech</p>
          <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="tech-search-input"
              style={{
                width: '100%', padding: '.4rem 2rem .4rem .75rem',
                borderRadius: 8,
                border: '2px solid rgba(255,255,255,.6)', background: 'rgba(255,255,255,.2)',
                color: '#fff', fontSize: '.82rem', outline: 'none',
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '.3px',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                  width: 20, height: 20, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,.3)', color: '#fff',
                  fontSize: '.65rem', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                }}
              >✕</button>
            )}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
        <div className="tech-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '16px',
          alignItems: 'start',
          justifyItems: 'center',
          height: 520,
          width: '100%',
          overflowY: 'scroll',
          alignContent: 'start',
          scrollbarWidth: 'none' as any,
          msOverflowStyle: 'none' as any,
        }}>
          {(() => {
            let displayTechs: Technology[]
            if (search.trim().length >= 2) {
              const q = search.toLowerCase()
              displayTechs = allTechs.filter(t =>
                t.name.toLowerCase().includes(q) || (t.categories || []).some(c => c.toLowerCase().includes(q))
              )
            } else {
              // Default + single char — same list, no shift
              const selectedList = allTechs.filter(t => selected.has(t.id))
              const featuredUnselected = techs.filter(t => !selected.has(t.id))
              const restIds = new Set([...selected, ...techs.map(t => t.id)])
              const rest = allTechs.filter(t => !restIds.has(t.id)).sort((a, b) => a.name.localeCompare(b.name))
              displayTechs = [...selectedList, ...featuredUnselected, ...rest]
            }
            return displayTechs
          })().map(t => {
            const isSelected = selected.has(t.id)
            const isSearching = search.trim().length >= 2
            const isHovered = hovered?.id === t.id
            const showColor = isSelected || isSearching || isHovered
            return (
              <div
                key={t.id}
                onClick={e => { toggle(t, e.clientX, e.clientY) }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  showTech(t)
                  if (!isSelected) {
                    el.style.background = 'rgba(255,255,255,.15)'
                    el.style.transform = 'translateY(-2px)'
                    el.style.boxShadow = '0 4px 12px rgba(0,0,0,.15)'
                  }
                }}
                onMouseLeave={e => {
                  startHide()
                  const el = e.currentTarget
                  if (!isSelected) {
                    el.style.background = 'rgba(255,255,255,.1)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }
                }}
                style={{
                  width: 56, height: 56,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10,
                  background: isSelected ? 'rgba(45,50,65,.85)' : 'rgba(255,255,255,.1)',
                  border: isSelected ? '1.5px solid rgba(255,255,255,.35)' : '1.5px solid rgba(255,255,255,.45)',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: isSelected ? '0 0 10px rgba(255,255,255,.1)' : 'none',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {(() => {
                  const hasWhiteFill = t.svg_logo_color && (
                    t.svg_logo_color.includes('fill="#fff') || t.svg_logo_color.includes('fill="#FFF') ||
                    t.svg_logo_color.includes("fill='#fff") || t.svg_logo_color.includes('fill="white"') ||
                    t.svg_logo_color.includes('fill="#ffffff') || t.svg_logo_color.includes('fill="#FFFFFF')
                  )
                  const brandDark = isDark(t.color)

                  if (!showColor) {
                    // Default: white monochrome
                    if (t.svg_logo) return <div style={{ width: 28, height: 28, color: '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
                    if (t.logo_url) return <img src={t.logo_url} alt={t.name} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    return null
                  }

                  const opaqueStyle = { width: 28, height: 28, opacity: 1, filter: 'brightness(1.75) saturate(1.3)' }

                  // Colour SVG exists and is safe to show (not too dark, not white-heavy)
                  if (t.svg_logo_color && !brandDark && !hasWhiteFill) {
                    return <div style={opaqueStyle} dangerouslySetInnerHTML={{ __html: t.svg_logo_color }} />
                  }

                  // Fallback: monochrome with brand tint (light blue for dark brands)
                  const tint = brandDark ? '#a0c4ff' : (t.color || '#fff')
                  if (t.svg_logo) return <div style={{ ...opaqueStyle, color: tint }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
                  return null
                })()}
              </div>
            )
          })}
        </div>

        {/* Info bar — overlay on bottom third of grid */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
          height: 80,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.85) 30%, rgba(0,0,0,.95))',
          padding: '0 1rem',
          transition: 'opacity .2s',
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
          {hovered && (
            <>
              {(hovered.svg_logo_color || hovered.svg_logo) && (
                <div
                  style={{ width: 32, height: 32, flexShrink: 0, color: hovered.svg_logo_color ? undefined : (hovered.color || '#fff') }}
                  dangerouslySetInnerHTML={{ __html: hovered.svg_logo_color || hovered.svg_logo }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: '.9rem',
                  fontWeight: 700, color: '#fff', marginRight: '.5rem',
                }}>
                  {hovered.name}
                </span>
                {hovered.categories?.length > 0 && (
                  <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)' }}>
                    {hovered.categories.join(' · ')}
                  </span>
                )}
                {hovered.description && (
                  <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.4, margin: '.1rem 0 0' }}>
                    {hovered.description}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        </div>

        {/* CTA — always rendered, fades in/out */}
        <div style={{
          marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem',
          height: 36, opacity: selected.size > 0 ? 1 : 0, transition: 'opacity .3s',
          pointerEvents: selected.size > 0 ? 'auto' : 'none',
        }}>
            <button
              onClick={() => {
                trackEvent('your_tech_submitted', { tech_count: selected.size, techs: selectedTechs.map(t => t.name).join(', ') })
                const subject = encodeURIComponent('Technology Stack Consultation')
                const body = encodeURIComponent(`Hi CXM,\n\nI'd like to discuss my technology stack:\n\n${selectedTechs.map(t => `• ${t.name}`).join('\n')}\n\nPlease get in touch.`)
                window.location.href = `mailto:hello@cxm.nz?subject=${subject}&body=${body}`
              }}
              style={{
                padding: '.45rem 1.2rem', borderRadius: 8, border: 'none',
                background: '#2563eb', color: '#fff', fontSize: '.8rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
                transition: 'background .2s',
              }}
            >
              Talk to us about your stack →
            </button>
            <button
              onClick={() => setSelected(new Set())}
              style={{
                padding: '.45rem .8rem', borderRadius: 8,
                border: '1px solid rgba(255,255,255,.2)', background: 'transparent',
                color: 'rgba(255,255,255,.5)', fontSize: '.75rem', cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
      </div>

    </>
  )
}
