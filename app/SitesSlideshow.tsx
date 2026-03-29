'use client'

import { useState, useEffect, useRef } from 'react'
import * as icons from 'lucide-react'

type Brand = { id: number; name: string; logo_url: string; description: string; url: string }
type Talent = { id: number; title: string; icon: string; tag: string; description: string }
type Site = { id: number; title: string; image_url: string; url: string; story: string; visible: boolean; brands: Brand[]; talents: Talent[] }

function getIcon(name: string) { return (icons as any)[name] || icons.Star }

export function SitesSlideshow() {
  const [sites, setSites] = useState<Site[]>([])
  const [current, setCurrent] = useState(0)
  const [storyOpen, setStoryOpen] = useState<Site | null>(null)
  const [fadePhase, setFadePhase] = useState<'visible' | 'fading-out' | 'black' | 'fading-in'>('visible')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transitionBusy = useRef(false)

  useEffect(() => {
    fetch('/api/sites').then(r => r.json()).then((all: Site[]) => setSites(all.filter(s => s.visible && s.image_url))).catch(() => {})
  }, [])

  const fadeTo = (getNext: (prev: number) => number) => {
    if (transitionBusy.current) return
    transitionBusy.current = true
    // Phase 1: fade to black (1.2s)
    setFadePhase('fading-out')
    setTimeout(() => {
      // Phase 2: hold black, swap image
      setFadePhase('black')
      setCurrent(getNext)
      // Phase 3: small pause then fade in (1.2s)
      setTimeout(() => {
        setFadePhase('fading-in')
        setTimeout(() => {
          setFadePhase('visible')
          transitionBusy.current = false
        }, 1200)
      }, 150)
    }, 1200)
  }

  // Auto-rotate
  useEffect(() => {
    if (sites.length <= 1) return
    timerRef.current = setInterval(() => {
      fadeTo(c => (c + 1) % sites.length)
    }, 6000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sites.length])

  if (sites.length === 0) return null

  const site = sites[current]

  return (
    <>
      <div
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current) }}
        onMouseLeave={() => { if (sites.length > 1) timerRef.current = setInterval(() => setCurrent(c => (c + 1) % sites.length), 5000) }}
        style={{
          position: 'relative', width: '100%', maxWidth: '404px', borderRadius: 12, overflow: 'hidden',
          aspectRatio: '16/10', cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(0,0,0,.25)',
        }}
      >
        {/* Image */}
        <img
          src={site.image_url.replace('/upload/', '/upload/w_800,h_500,c_fill/')}
          alt={site.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Gradient overlay — top banner */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 25%, transparent 50%)',
        }} />

        {/* Fade to black overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: '#000',
          opacity: fadePhase === 'fading-out' || fadePhase === 'black' ? 1 : 0,
          transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
          zIndex: 3,
        }} />

        {/* Top banner: title + info button */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px',
        }}>
          <h4 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '.95rem',
            fontWeight: 700, color: '#fff', letterSpacing: '.3px',
            textShadow: '0 1px 4px rgba(0,0,0,.4)',
            margin: 0,
          }}>
            {site.title}
          </h4>
          <button
            onClick={() => setStoryOpen(site)}
            title="What's the story?"
            style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,.25)', color: '#fff',
              fontSize: '.8rem', fontWeight: 700, fontStyle: 'italic', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Georgia, serif',
              transition: 'background .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
          >
            i
          </button>
        </div>

        {/* Prev/Next arrows */}
        {sites.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); fadeTo(c => (c - 1 + sites.length) % sites.length) }}
              style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 5,
                width: 28, height: 28, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,.8)', color: '#111', fontSize: '.9rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); fadeTo(c => (c + 1) % sites.length) }}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 5,
                width: 28, height: 28, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,.8)', color: '#111', fontSize: '.9rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ›
            </button>
          </>
        )}

        {/* Dots */}
        {sites.length > 1 && (
          <div style={{ position: 'absolute', bottom: 8, right: 16, display: 'flex', gap: 4 }}>
            {sites.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: i === current ? '#fff' : 'rgba(255,255,255,.4)',
                  transition: 'background .2s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Story modal */}
      {storyOpen && (
        <div
          onClick={() => setStoryOpen(null)}
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
              background: '#fff', borderRadius: 16, padding: '2rem',
              maxWidth: 520, width: '95%', maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 700 }}>{storyOpen.title}</h3>
              <button onClick={() => setStoryOpen(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>

            {storyOpen.image_url && (
              <img src={storyOpen.image_url.replace('/upload/', '/upload/w_600,h_300,c_fill/')} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: '1rem' }} />
            )}

            {storyOpen.story && (
              <p style={{ fontSize: '.9rem', color: '#555', lineHeight: 1.8, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>{storyOpen.story}</p>
            )}

            {storyOpen.url && (
              <a href={storyOpen.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: '.82rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, marginBottom: '1.5rem' }}>
                Visit site →
              </a>
            )}

            {/* Brands row */}
            {storyOpen.brands.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#999', marginBottom: '.5rem' }}>Technologies</p>
                <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                  {storyOpen.brands.map(b => (
                    <div key={b.id} title={b.description ? `${b.name} — ${b.description}` : b.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3' }}>
                        <img src={b.logo_url} alt={b.name} style={{ width: 22, height: 22, objectFit: 'contain' }} />
                      </div>
                      <span style={{ fontSize: '.55rem', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: '#999' }}>{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Talents row */}
            {storyOpen.talents.length > 0 && (
              <div>
                <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#999', marginBottom: '.5rem' }}>Services</p>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {storyOpen.talents.map(t => {
                    const Icon = getIcon(t.icon)
                    return (
                      <div key={t.id} title={t.description ? `${t.title} — ${t.description}` : t.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                          <Icon size={18} color="#fff" strokeWidth={1.5} />
                        </div>
                        <span style={{ fontSize: '.55rem', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: '#999' }}>{t.title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
