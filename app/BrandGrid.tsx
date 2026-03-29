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
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
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

  const showTech = (t: Technology, el: HTMLElement) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    const rect = el.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
    setHovered(t)
  }

  const startHide = () => { hideTimer.current = setTimeout(() => setHovered(null), 200) }
  const cancelHide = () => { if (hideTimer.current) clearTimeout(hideTimer.current) }

  const selectedTechs = techs.filter(t => selected.has(t.id))

  if (techs.length === 0) return null

  return (
    <>
      <div className="v2-clients-strip">
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
                width: '100%', padding: '.4rem .75rem', paddingRight: search ? '2rem' : '.75rem',
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '16px',
          alignItems: 'center',
          justifyItems: 'center',
          height: 320,
          overflowY: 'hidden',
          alignContent: 'start',
        }}>
          {(() => {
            let displayTechs: Technology[]
            if (search.trim() && search.trim().length >= 2) {
              const q = search.toLowerCase()
              displayTechs = allTechs.filter(t =>
                t.name.toLowerCase().includes(q) || (t.categories || []).some(c => c.toLowerCase().includes(q))
              )
            } else if (search.trim().length === 1) {
              // Single char — don't search yet, show featured
              displayTechs = techs
            } else {
              // No search — show featured with selected ones first
              const selectedList = techs.filter(t => selected.has(t.id))
              const unselectedList = techs.filter(t => !selected.has(t.id))
              displayTechs = [...selectedList, ...unselectedList]
            }
            return displayTechs
          })().map(t => {
            const isSelected = selected.has(t.id)
            return (
              <div
                key={t.id}
                onClick={() => toggle(t)}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  showTech(t, el)
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
                {t.svg_logo ? (
                  <div style={{ width: 28, height: 28, color: '#fff' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
                ) : t.logo_url ? (
                  <img src={t.logo_url} alt={t.name} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                ) : null}
                {flash?.id === t.id && (
                  <span style={{
                    position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
                    fontSize: '.6rem', fontWeight: 700, whiteSpace: 'nowrap',
                    color: flash.action === 'added' ? '#4ade80' : '#f87171',
                    opacity: 1, transition: 'opacity .8s',
                    pointerEvents: 'none',
                  }}>
                    {flash.action === 'added' ? '✓ Added' : '✕ Removed'}
                  </span>
                )}
              </div>
            )
          })}
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
            <p style={{ fontSize: '.82rem', color: '#666', lineHeight: 1.5, marginBottom: '.5rem' }}>
              {hovered.description}
            </p>
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
