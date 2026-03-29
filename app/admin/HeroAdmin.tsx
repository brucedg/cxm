'use client'

import { useState, useEffect, useRef } from 'react'

type CTA = { text: string; url: string; style: string }
type Tech = { id: number; name: string; svg_logo: string; color: string; categories: string[] }
type Hero = {
  tagline: string; title: string; titleLight: string; titleAccent: string; titleEnd: string;
  description: string; ctas: CTA[]; disciplines: string[]; backgroundImage?: string
  featuredTechIds?: number[]
}

const empty: Hero = { tagline: '', title: '', titleLight: '', titleAccent: '', titleEnd: '', description: '', ctas: [], disciplines: [], backgroundImage: '', featuredTechIds: [] }

export function HeroAdmin({ authHeader }: { authHeader: string }) {
  const [form, setForm] = useState<Hero>(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allTechs, setAllTechs] = useState<Tech[]>([])
  const [techSearch, setTechSearch] = useState('')
  const [showTechPicker, setShowTechPicker] = useState(false)
  const mlRef = useRef<any>(null)

  useEffect(() => {
    fetch('/api/settings?key=hero').then(r => r.json()).then(setForm).catch(() => {}).finally(() => setLoading(false))
    fetch('/api/technologies').then(r => r.json()).then(setAllTechs).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({ key: 'hero', value: form }),
      })
      if (!res.ok) { alert('Save failed — check your login'); setSaving(false); return }
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { alert('Save failed') }
    setSaving(false)
  }

  const updateCta = (i: number, field: keyof CTA, value: string) => {
    setForm(prev => { const ctas = [...prev.ctas]; ctas[i] = { ...ctas[i], [field]: value }; return { ...prev, ctas } })
  }

  const openMediaLibrary = async () => {
    const res = await fetch('/api/cloudinary', { headers: { Authorization: authHeader } })
    if (!res.ok) return
    const auth = await res.json()
    const w = window as any
    const scriptId = 'cloudinary-ml-script'

    const launch = () => {
      if (mlRef.current) { mlRef.current.show(); return }
      mlRef.current = w.cloudinary.createMediaLibrary(
        {
          cloud_name: auth.cloud_name,
          api_key: auth.api_key,
          timestamp: auth.timestamp,
          signature: auth.signature,
          folder: { path: 'cxm', resource_type: 'image' },
          multiple: false, max_files: 1, insert_caption: 'Select',
        },
        {
          insertHandler: (data: any) => {
            if (data?.assets?.[0]?.secure_url) {
              setForm(f => ({ ...f, backgroundImage: data.assets[0].secure_url }))
            }
          },
        },
      )
      mlRef.current.show()
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://media-library.cloudinary.com/global/all.js'
      script.onload = launch
      document.head.appendChild(script)
    } else { launch() }
  }

  if (loading) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1.5rem' }}>Edit the hero section on the homepage.</p>

      {/* Background Image */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Background Image</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e8e8e4', borderRadius: 8, padding: '.75rem 1rem' }}>
          {form.backgroundImage ? (
            <img src={form.backgroundImage.replace('/upload/', '/upload/w_200,h_100,c_fill/')} alt="Background" style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 120, height: 60, borderRadius: 6, background: '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '.75rem', flexShrink: 0 }}>No image</div>
          )}
          <div style={{ flex: 1 }}>
            <button onClick={openMediaLibrary} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' }}>Browse</button>
            {form.backgroundImage && (
              <button onClick={() => setForm(f => ({ ...f, backgroundImage: '' }))} style={{ background: '#fee', color: '#c00', border: 'none', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', marginLeft: '.5rem' }}>Remove</button>
            )}
            <p style={{ fontSize: '.72rem', color: '#999', marginTop: '.3rem' }}>Used as the homepage hero background.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Tagline</label>
          <input style={inputStyle} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Digital Consultancy" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          <div>
            <label style={labelStyle}>Title line 1</label>
            <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="We build" />
          </div>
          <div>
            <label style={labelStyle}>Title light</label>
            <input style={inputStyle} value={form.titleLight} onChange={e => setForm(f => ({ ...f, titleLight: e.target.value }))} placeholder="the digital" />
          </div>
          <div>
            <label style={labelStyle}>Title accent</label>
            <input style={inputStyle} value={form.titleAccent} onChange={e => setForm(f => ({ ...f, titleAccent: e.target.value }))} placeholder="infrastructure" />
          </div>
          <div>
            <label style={labelStyle}>Title end</label>
            <input style={inputStyle} value={form.titleEnd} onChange={e => setForm(f => ({ ...f, titleEnd: e.target.value }))} placeholder="of great brands." />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Disciplines (comma separated)</label>
          <input style={inputStyle} value={form.disciplines.join(', ')} onChange={e => setForm(f => ({ ...f, disciplines: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
        </div>
      </div>

      <label style={{ ...labelStyle, marginBottom: '.75rem' }}>Buttons</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.5rem' }}>
        {form.ctas.map((cta, i) => (
          <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', border: '1px solid #e8e8e4', borderRadius: 8, padding: '.5rem .75rem' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={cta.text} onChange={e => updateCta(i, 'text', e.target.value)} placeholder="Button text" />
            <input style={{ ...inputStyle, flex: 1 }} value={cta.url} onChange={e => updateCta(i, 'url', e.target.value)} placeholder="URL" />
            <select style={{ ...inputStyle, width: 'auto' }} value={cta.style} onChange={e => updateCta(i, 'style', e.target.value)}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
            <button onClick={() => setForm(f => ({ ...f, ctas: f.ctas.filter((_, j) => j !== i) }))} style={{ background: '#fee', color: '#c00', border: 'none', borderRadius: 6, padding: '.3rem .6rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
        ))}
        {form.ctas.length < 3 && (
          <button onClick={() => setForm(f => ({ ...f, ctas: [...f.ctas, { text: '', url: '', style: 'primary' }] }))} style={{ background: '#f5f5f3', color: '#666', border: 'none', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>+ Add Button</button>
        )}
      </div>

      {/* Featured Technologies */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Featured Technologies</label>
        <p style={{ fontSize: '.78rem', color: '#999', marginBottom: '.75rem' }}>Choose technologies shown on the homepage. Drag to reorder.</p>

        {/* Selected techs — draggable */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', padding: '.5rem', border: '1px solid #e8e8e4', borderRadius: 8, minHeight: 48, marginBottom: '.75rem', background: '#fff' }}>
          {(form.featuredTechIds || []).map((id, idx) => {
            const tech = allTechs.find(t => t.id === id)
            if (!tech) return null
            return (
              <span
                key={id}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', String(idx))}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
                  setForm(f => {
                    const ids = [...(f.featuredTechIds || [])]
                    const [moved] = ids.splice(fromIdx, 1)
                    ids.splice(idx, 0, moved)
                    return { ...f, featuredTechIds: ids }
                  })
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                  background: '#f0f0ff', padding: '.25rem .5rem .25rem .35rem',
                  borderRadius: 6, fontSize: '.78rem', fontWeight: 500,
                  cursor: 'grab', userSelect: 'none',
                }}
              >
                {tech.svg_logo && (
                  <span style={{ width: 16, height: 16, display: 'inline-flex', color: tech.color || '#666' }} dangerouslySetInnerHTML={{ __html: tech.svg_logo }} />
                )}
                {tech.name}
                <button
                  onClick={() => setForm(f => ({ ...f, featuredTechIds: (f.featuredTechIds || []).filter(x => x !== id) }))}
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '.7rem', padding: 0, lineHeight: 1, marginLeft: '.15rem' }}
                >✕</button>
              </span>
            )
          })}
          {(form.featuredTechIds || []).length === 0 && (
            <span style={{ fontSize: '.78rem', color: '#bbb', padding: '.15rem' }}>No technologies selected — all will be shown</span>
          )}
        </div>

        <button
          onClick={() => setShowTechPicker(true)}
          style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Technologies
        </button>
      </div>

      {/* Tech picker modal */}
      {showTechPicker && (
        <div onClick={() => setShowTechPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e8e8e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600 }}>Add Technologies</h3>
              <button onClick={() => setShowTechPicker(false)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            <div style={{ padding: '.5rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
              <input
                type="text" value={techSearch} onChange={e => setTechSearch(e.target.value)}
                placeholder="Search technologies..." autoFocus
                style={{ width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: '.85rem', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '.4rem' }}>
                {allTechs
                  .filter(t => {
                    if (!techSearch) return true
                    const q = techSearch.toLowerCase()
                    return t.name.toLowerCase().includes(q) || (t.categories || []).some(c => c.toLowerCase().includes(q))
                  })
                  .map(t => {
                    const isSelected = (form.featuredTechIds || []).includes(t.id)
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (!isSelected) setForm(f => ({ ...f, featuredTechIds: [...(f.featuredTechIds || []), t.id] }))
                        }}
                        disabled={isSelected}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '.4rem',
                          padding: '.4rem .5rem', borderRadius: 8,
                          border: isSelected ? '1px solid #c8d8f8' : '1px solid #e8e8e4',
                          background: isSelected ? '#e8f0fe' : '#fff',
                          cursor: isSelected ? 'default' : 'pointer',
                          textAlign: 'left',
                          transition: 'border-color .1s, background .1s',
                          opacity: isSelected ? 0.6 : 1,
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#2563eb' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#e8e8e4' }}
                      >
                        {t.svg_logo ? (
                          <span style={{ width: 20, height: 20, flexShrink: 0, color: isSelected ? '#99b3e0' : (t.color || '#666') }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
                        ) : (
                          <span style={{ width: 20, height: 20, flexShrink: 0, background: '#f0f0f0', borderRadius: 4 }} />
                        )}
                        <span style={{ fontSize: '.78rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? '#99b3e0' : '#111' }}>{t.name}</span>
                        {isSelected && <span style={{ fontSize: '.7rem', color: '#2563eb', marginLeft: 'auto' }}>✓</span>}
                      </button>
                    )
                  })
                }
              </div>
            </div>
            <div style={{ padding: '.75rem 1.25rem', borderTop: '1px solid #e8e8e4', textAlign: 'right' }}>
              <button onClick={() => { setShowTechPicker(false); setTechSearch('') }} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
        <button onClick={save} disabled={saving} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '.5rem 1.5rem', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
        {saved && <span style={{ color: '#2563eb', fontSize: '.85rem', fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#999', marginBottom: '.25rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none' }
