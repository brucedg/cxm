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
  const [hoveredBrand, setHoveredBrand] = useState<Brand | null>(null)
  const [hoveredTalent, setHoveredTalent] = useState<Talent | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/sites').then(r => r.json()).then((all: Site[]) => setSites(all.filter(s => s.visible))).catch(() => {})
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (sites.length <= 1) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % sites.length), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sites.length])

  if (sites.length === 0) return null

  const site = sites[current]

  return (
    <>
      <div style={{
        position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden',
        aspectRatio: '16/10', cursor: 'pointer',
      }}>
        {/* Image */}
        <img
          src={site.image_url.replace('/upload/', '/upload/w_800,h_500,c_fill/')}
          alt={site.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity .5s' }}
        />

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.1) 50%, transparent 100%)',
        }} />

        {/* Title */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 60 }}>
          <h4 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem',
            fontWeight: 700, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,.5)',
          }}>
            {site.title}
          </h4>
        </div>

        {/* Story button */}
        <button
          onClick={() => setStoryOpen(site)}
          title="What's the story?"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,.3)', color: '#fff',
            fontSize: '.9rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ?
        </button>

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
          onClick={() => { setStoryOpen(null); setHoveredBrand(null); setHoveredTalent(null) }}
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
              <button onClick={() => { setStoryOpen(null); setHoveredBrand(null); setHoveredTalent(null) }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>✕</button>
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
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', position: 'relative' }}>
                  {storyOpen.brands.map(b => (
                    <div
                      key={b.id}
                      onMouseEnter={() => { setHoveredBrand(b); setHoveredTalent(null) }}
                      onMouseLeave={() => setHoveredBrand(null)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        background: '#f5f5f3', transition: 'background .2s',
                      }}
                    >
                      <img src={b.logo_url} alt={b.name} style={{ width: 22, height: 22, objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
                {hoveredBrand && (
                  <div style={{ marginTop: '.5rem', padding: '.5rem .75rem', background: '#f9f9f7', borderRadius: 8, fontSize: '.82rem' }}>
                    <strong>{hoveredBrand.name}</strong>
                    {hoveredBrand.description && <span style={{ color: '#999' }}> — {hoveredBrand.description}</span>}
                  </div>
                )}
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
                      <div
                        key={t.id}
                        onMouseEnter={() => { setHoveredTalent(t); setHoveredBrand(null) }}
                        onMouseLeave={() => setHoveredTalent(null)}
                        style={{
                          width: 36, height: 36, borderRadius: 8, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          background: '#111', transition: 'background .2s',
                        }}
                      >
                        <Icon size={18} color="#fff" strokeWidth={1.5} />
                      </div>
                    )
                  })}
                </div>
                {hoveredTalent && (
                  <div style={{ marginTop: '.5rem', padding: '.5rem .75rem', background: '#f9f9f7', borderRadius: 8, fontSize: '.82rem' }}>
                    <strong>{hoveredTalent.title}</strong>
                    {hoveredTalent.description && <span style={{ color: '#999' }}> — {hoveredTalent.description}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
