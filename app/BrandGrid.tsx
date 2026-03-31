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
  const [selected, setSelected] = useState<number[]>([])
  const selectedSet = new Set(selected)
  const [search, setSearch] = useState('')
  const [flash, setFlash] = useState<{ id: number; action: 'added' | 'removed'; x: number; y: number } | null>(null)
  const [hovered, setHovered] = useState<Technology | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

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
        if (stored) setSelected(JSON.parse(stored))
      } catch { /* ignore */ }
    }).catch(() => {})
  }, [techIds])

  // Persist selections once user interacts
  const hasEdited = useRef(false)
  useEffect(() => {
    if (!hasEdited.current) return
    localStorage.setItem('cxm-your-tech', JSON.stringify(selected))
  }, [selected])

  const toggle = useCallback((tech: Technology, x?: number, y?: number) => {
    hasEdited.current = true
    const wasSelected = selectedSet.has(tech.id)
    setSelected(prev => {
      if (prev.includes(tech.id)) {
        return prev.filter(id => id !== tech.id)
      } else {
        trackEvent('your_tech_added', { tech_name: tech.name })
        return [...prev, tech.id]
      }
    })
    setFlash({ id: tech.id, action: wasSelected ? 'removed' : 'added', x: x || 0, y: y || 0 })
    setTimeout(() => setFlash(null), 1200)
    if (!wasSelected && search.trim()) setSearch('')
  }, [selectedSet, search])

  const showTech = (t: Technology) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setHovered(t)
  }

  const startHide = () => { hideTimer.current = setTimeout(() => setHovered(null), 300) }

  // Check if a color SVG is all-dark (only black/very dark fills, no other colors)
  // These need inversion on dark backgrounds
  const isAllDarkSvg = (svg: string) => {
    if (!svg) return false
    const fills = svg.match(/fill="([^"]+)"/g) || []
    if (fills.length === 0) return false
    return fills.every(f => {
      const val = f.match(/fill="([^"]+)"/)?.[1] || ''
      if (val === 'none' || val === 'currentColor') return true // neutral, skip
      if (val.startsWith('url(')) return true // gradient ref, skip
      if (val === 'black' || val === '#000' || val === '#000000') return true
      // Handle shorthand hex (#123)
      if (val.startsWith('#') && (val.length === 4 || val.length === 7)) {
        let r: number, g: number, b: number
        if (val.length === 4) {
          r = parseInt(val[1] + val[1], 16)
          g = parseInt(val[2] + val[2], 16)
          b = parseInt(val[3] + val[3], 16)
        } else {
          r = parseInt(val.slice(1, 3), 16)
          g = parseInt(val.slice(3, 5), 16)
          b = parseInt(val.slice(5, 7), 16)
        }
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.2
      }
      return false
    })
  }

  // Check if white is the dominant fill in a color SVG (designed for light backgrounds)
  const isWhiteDominant = (svg: string) => {
    if (!svg) return false
    const fills = svg.match(/fill="([^"]+)"/g) || []
    const whiteFills = fills.filter(f => {
      const v = f.match(/fill="([^"]+)"/)?.[1] || ''
      return v === '#fff' || v === '#FFF' || v === '#ffffff' || v === '#FFFFFF' || v === 'white'
    })
    // White is dominant if it's more than a third of all non-transparent fills
    const solidFills = fills.filter(f => {
      const v = f.match(/fill="([^"]+)"/)?.[1] || ''
      return v !== 'none' && !v.startsWith('url(')
    })
    return solidFills.length > 0 && whiteFills.length / solidFills.length > 0.6
  }

  // Render a tech icon for colored contexts (selected state, stack panel)
  const renderColorIcon = (t: Technology, size: number) => {
    if (t.svg_logo_color) {
      // All-dark color SVG (Next.js, Vercel, AWS etc) — use white monochrome
      if (isAllDarkSvg(t.svg_logo_color)) {
        if (t.svg_logo) return <div style={{ width: size, height: size, color: '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
      }
      // White-dominant color SVG won't show on dark bg — use monochrome with brand color
      if (isWhiteDominant(t.svg_logo_color) && t.svg_logo) {
        return <div style={{ width: size, height: size, color: t.color || '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
      }
      return <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: t.svg_logo_color }} />
    }
    // No color SVG — monochrome with brand color
    if (t.svg_logo) return <div style={{ width: size, height: size, color: t.color || '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
    return null
  }

  const techMap = allTechs.reduce((m, t) => { m.set(t.id, t); return m }, new Map<number, Technology>())
  const selectedTechs = selected.map(id => techMap.get(id)).filter(Boolean) as Technology[]

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
        <p style={{ margin: '0 0 1rem', whiteSpace: 'nowrap' }}>Build Your Stack</p>
        <div className="tech-layout" style={{ position: 'relative', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div className="tech-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 56px)',
          gap: '16px',
          alignItems: 'start',
          justifyItems: 'center',
          height: 520,
          flex: '0 0 auto',
          width: 'calc((56px * 7) + (16px * 6))',
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
              const featuredIds = new Set(techs.map(t => t.id))
              const rest = allTechs.filter(t => !featuredIds.has(t.id)).sort((a, b) => a.name.localeCompare(b.name))
              displayTechs = [...techs, ...rest]
            }
            if (displayTechs.length === 0) {
              return (
                <div style={{
                  gridColumn: '1 / -1',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '12px', padding: '3rem 1rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                    background: 'rgba(0,0,0,.45)', borderRadius: 12, padding: '1.5rem 2rem',
                    border: '1.5px solid rgba(255,255,255,.2)', color: '#fff',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                    <span style={{ fontSize: '.82rem', fontWeight: 500 }}>No results for &ldquo;{search.trim()}&rdquo;</span>
                  </div>
                </div>
              )
            }
            return displayTechs.map(t => {
            const isSelected = selectedSet.has(t.id)
            const isSearching = search.trim().length >= 2
            const showLabel = search.trim().length >= 3
            const isHovered = hovered?.id === t.id
            const showColor = isSelected || isSearching || isHovered
            return (
              <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div
                onClick={e => { toggle(t, e.clientX, e.clientY) }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  showTech(t)
                  if (!isSelected) {
                    el.style.background = isSearching ? 'rgba(90,95,110,.75)' : 'rgba(255,255,255,.15)'
                    el.style.boxShadow = isSearching ? '0 0 8px rgba(255,255,255,.08)' : '0 0 8px rgba(0,0,0,.15)'
                  }
                }}
                onMouseLeave={e => {
                  startHide()
                  const el = e.currentTarget
                  if (!isSelected) {
                    el.style.background = isSearching ? 'rgba(80,85,100,.7)' : 'rgba(255,255,255,.1)'
                    el.style.boxShadow = 'none'
                  }
                }}
                style={{
                  width: 56, height: 56,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: isSelected ? 14 : 10,
                  background: isSelected
                    ? 'linear-gradient(to bottom, rgba(60,65,80,.9), rgba(35,38,50,.95))'
                    : isSearching ? 'rgba(80,85,100,.7)' : 'rgba(255,255,255,.1)',
                  border: isSelected ? '1px solid rgba(255,255,255,.2)' : '1.5px solid rgba(255,255,255,.45)',
                  borderTop: isSelected ? '1px solid rgba(255,255,255,.3)' : undefined,
                  borderBottom: isSelected ? '1px solid rgba(0,0,0,.3)' : undefined,
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: isSelected ? '0 0 0 2px rgba(37,99,235,.7), inset 0 1px 0 rgba(255,255,255,.08)' : 'none',
                }}
              >
                {!showColor ? (
                  // Default: white monochrome
                  t.svg_logo ? <div style={{ width: 28, height: 28, color: '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
                  : t.logo_url ? <img src={t.logo_url} alt={t.name} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                  : null
                ) : renderColorIcon(t, 28)}
              </div>
              {showLabel && (
                <span style={{
                  fontSize: '.55rem', color: 'rgba(255,255,255,.7)', textAlign: 'center',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
                  width: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}>{t.name}</span>
              )}
              </div>
            )
          })
          })()}
        </div>

        {/* Info bar — overlay on bottom third of grid */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, zIndex: 5,
          width: 'calc(((56px * 7) + (16px * 6)) * 1.5 + 1.25rem)',
          height: 160,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.85) 30%, rgba(0,0,0,.95))',
          padding: '0 1rem',
          transition: 'opacity .2s',
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
          {hovered && (
            <>
              {(hovered.svg_logo_color || hovered.svg_logo) && (
                <div style={{ flexShrink: 0 }}>{renderColorIcon(hovered, 48)}</div>
              )}
              <div style={{ minWidth: 0 }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem',
                  fontWeight: 700, color: '#fff', marginRight: '.5rem',
                }}>
                  {hovered.name}
                </span>
                {hovered.categories?.length > 0 && (
                  <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.5)' }}>
                    {hovered.categories.join(' · ')}
                  </span>
                )}
                {hovered.description && (
                  <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.5, margin: '.25rem 0 0' }}>
                    {hovered.description}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        {/* Your Stack panel */}
        <div className="your-stack-panel" style={{
          flex: '0 0 auto', width: 'calc(((56px * 7) + (16px * 6)) / 2 + 30px)', height: 520,
          background: 'rgba(0,0,0,.45)',
          border: '1.5px solid rgba(255,255,255,.2)',
          borderRadius: 12,
          padding: '1rem',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          overflowY: 'auto',
          scrollbarWidth: 'none' as any,
          msOverflowStyle: 'none' as any,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
            <p style={{
              margin: 0, fontSize: '.85rem', fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#fff', letterSpacing: '.5px', textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>Your Stack</p>
            <div style={{ position: 'relative', marginLeft: 'auto', flex: '0 1 160px', minWidth: 80 }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for Tech"
                className="tech-search-input"
                style={{
                  width: '100%', padding: '.3rem 1.8rem .3rem .6rem',
                  borderRadius: 6,
                  border: '1.5px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.1)',
                  color: '#fff', fontSize: '.75rem', outline: 'none',
                  fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '.3px',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)',
                    width: 18, height: 18, borderRadius: '50%', border: 'none',
                    background: 'rgba(255,255,255,.3)', color: '#fff',
                    fontSize: '.6rem', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                  }}
                >✕</button>
              )}
            </div>
          </div>
          {selectedTechs.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '.82rem',
              fontFamily: "'Space Grotesk', sans-serif", textAlign: 'center',
              padding: '0 1rem',
            }}>
              Click technologies to add them here
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedTechs.map((t, idx) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#5b8def' }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = '#3a3d4a' }}
                  onDrop={e => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = '#3a3d4a'
                    if (dragIdx === null || dragIdx === idx) return
                    hasEdited.current = true
                    setSelected(prev => {
                      const next = [...prev]
                      const [moved] = next.splice(dragIdx, 1)
                      next.splice(idx, 0, moved)
                      return next
                    })
                    setDragIdx(null)
                  }}
                  onDragEnd={() => setDragIdx(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '.4rem .55rem', borderRadius: 8,
                    background: dragIdx === idx ? '#353848' : '#2a2d3a',
                    border: '1px solid #3a3d4a',
                    cursor: 'grab', transition: 'background .2s, border-color .2s',
                    opacity: dragIdx === idx ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (dragIdx === null) { e.currentTarget.style.background = '#353848'; showTech(t) } }}
                  onMouseLeave={e => { if (dragIdx === null) { e.currentTarget.style.background = '#2a2d3a'; startHide() } }}
                >
                  {(t.svg_logo_color || t.svg_logo) && (
                    <div style={{ flexShrink: 0 }}>{renderColorIcon(t, 22)}</div>
                  )}
                  <span style={{
                    fontSize: '.78rem', fontWeight: 600, color: '#fff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{t.name}</span>
                  <span
                    onClick={e => { e.stopPropagation(); toggle(t, e.clientX, e.clientY) }}
                    style={{
                      fontSize: '.65rem', color: 'rgba(255,255,255,.45)', flexShrink: 0,
                      cursor: 'pointer', padding: '2px',
                    }}
                  >✕</span>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* CTA — always rendered, fades in/out */}
        <div style={{
          marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem',
          height: 36, opacity: selected.length > 0 ? 1 : 0, transition: 'opacity .3s',
          pointerEvents: selected.length > 0 ? 'auto' : 'none',
        }}>
            <button
              onClick={() => {
                trackEvent('your_tech_submitted', { tech_count: selected.length, techs: selectedTechs.map(t => t.name).join(', ') })
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
              onClick={() => setSelected([])}
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
