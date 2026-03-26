'use client'

import { useState, useEffect } from 'react'

type CTA = { text: string; url: string; style: string }
type Hero = {
  tagline: string; title: string; titleLight: string; titleAccent: string; titleEnd: string;
  description: string; ctas: CTA[]; disciplines: string[]
}

const empty: Hero = { tagline: '', title: '', titleLight: '', titleAccent: '', titleEnd: '', description: '', ctas: [], disciplines: [] }

export function HeroAdmin({ authHeader }: { authHeader: string }) {
  const [form, setForm] = useState<Hero>(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings?key=hero').then(r => r.json()).then(setForm).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({ key: 'hero', value: form }),
      })
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const updateCta = (i: number, field: keyof CTA, value: string) => {
    setForm(prev => { const ctas = [...prev.ctas]; ctas[i] = { ...ctas[i], [field]: value }; return { ...prev, ctas } })
  }

  if (loading) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1.5rem' }}>Edit the hero section on the homepage.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Tagline</label>
          <input style={inputStyle} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Senior Digital Consultancy" />
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

      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
        <button onClick={save} disabled={saving} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '.5rem 1.5rem', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
        {saved && <span style={{ color: '#2563eb', fontSize: '.85rem', fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#999', marginBottom: '.25rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none' }
