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
  const [flash, setFlash] = useState<{ id: number; action: 'added' | 'removed' } | null>(null)
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

  const toggle = useCallback((tech: Technology) => {
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
    setFlash({ id: tech.id, action: wasSelected ? 'removed' : 'added' })
    setTimeout(() => setFlash(null), 1200)
    // If adding from search results, clear search to return to main grid
    if (!wasSelected && search.trim()) setSearch('')
  }, [selected, search])

  const showTech = (t: Technology) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setHovered(t)
  }

  const startHide = () => { hideTimer.current = setTimeout(() => setHovered(null), 300) }

  const selectedTechs = techs.filter(t => selected.has(t.id))

  if (techs.length === 0) return null

  return (
    <>
      <div className="v2-clients-strip" style={{ minWidth: 0, width: '100%', position: 'relative', contain: 'size layout style', height: 680 }}>
        {/* Toast confirmation */}
        {flash && (
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            background: flash.action === 'added' ? 'rgba(22,163,74,.9)' : 'rgba(220,38,38,.85)',
            color: '#fff', padding: '.35rem 1rem', borderRadius: 20,
            fontSize: '.78rem', fontWeight: 600, zIndex: 20,
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '.3px',
            boxShadow: '0 4px 12px rgba(0,0,0,.3)',
            animation: 'fadeIn .2s ease-out',
            whiteSpace: 'nowrap',
          }}>
            {flash.action === 'added' ? '✓ Added to your tech stack' : '✕ Removed from your tech stack'}
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
            const showColor = isSelected || isSearching
            return (
              <div
                key={t.id}
                onClick={() => toggle(t)}
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
                  background: isSelected ? 'rgba(37,99,235,.35)' : 'rgba(255,255,255,.1)',
                  border: isSelected ? '2px solid rgba(37,99,235,.7)' : '1.5px solid rgba(255,255,255,.45)',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: isSelected ? '0 0 12px rgba(37,99,235,.2)' : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {showColor && (t.svg_logo_color || t.svg_logo) ? (
                  <div style={{ width: 28, height: 28, color: t.svg_logo_color ? undefined : (t.color || '#fff') }} dangerouslySetInnerHTML={{ __html: t.svg_logo_color || t.svg_logo }} />
                ) : t.svg_logo ? (
                  <div style={{ width: 28, height: 28, color: '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
                ) : t.logo_url ? (
                  <img src={t.logo_url} alt={t.name} style={{ width: 28, height: 28, objectFit: 'contain', filter: showColor ? 'none' : 'brightness(0) invert(1)' }} />
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Info bar — fixed position below grid */}
        <div style={{
          height: 56, marginTop: '.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem',
          transition: 'opacity .2s',
          opacity: hovered ? 1 : 0,
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

        {/* CTA when techs selected */}
        {selected.size > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem' }}>
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
        )}
      </div>

    </>
  )
}
