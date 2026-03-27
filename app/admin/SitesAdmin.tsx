'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AdminModal } from './AdminModal'

type Brand = { id: number; name: string; logo_url: string }
type Talent = { id: number; title: string; icon: string }
type Site = { id: number; title: string; image_url: string; url: string; story: string; visible: boolean; sort_order: number; brands: Brand[]; talents: Talent[] }

const empty = { title: '', image_url: '', url: '', story: '', visible: true, sort_order: 0, brand_ids: [] as number[], talent_ids: [] as number[] }

export function SitesAdmin({ authHeader }: { authHeader: string }) {
  const [sites, setSites] = useState<Site[]>([])
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [allTalents, setAllTalents] = useState<Talent[]>([])
  const [editing, setEditing] = useState<Site | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const mlRef = useRef<any>(null)

  const fetchAll = useCallback(async () => {
    const [sitesRes, brandsRes, talentsRes] = await Promise.all([
      fetch('/api/sites'), fetch('/api/brands'), fetch('/api/talents'),
    ])
    if (sitesRes.ok) setSites(await sitesRes.json())
    if (brandsRes.ok) setAllBrands(await brandsRes.json())
    if (talentsRes.ok) setAllTalents(await talentsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const startEdit = (s: Site) => {
    setEditing(s); setCreating(false)
    setForm({ title: s.title, image_url: s.image_url, url: s.url, story: s.story, visible: s.visible, sort_order: s.sort_order, brand_ids: s.brands.map(b => b.id), talent_ids: s.talents.map(t => t.id) })
  }
  const startCreate = () => { setEditing(null); setCreating(true); setForm({ ...empty, sort_order: sites.length + 1 }) }
  const cancel = () => { setEditing(null); setCreating(false); setForm(empty) }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const body = creating ? form : { id: editing!.id, ...form }
    await fetch('/api/sites', {
      method: creating ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    })
    await fetchAll(); cancel(); setSaving(false)
  }

  const remove = async (id: number) => {
    await fetch('/api/sites', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify({ id }) })
    await fetchAll(); if (editing?.id === id) cancel()
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
        { cloud_name: auth.cloud_name, api_key: auth.api_key, timestamp: auth.timestamp, signature: auth.signature, folder: { path: 'CXM/Sites', resource_type: 'image' }, multiple: false, max_files: 1, insert_caption: 'Select' },
        { insertHandler: (data: any) => { if (data?.assets?.[0]?.secure_url) setForm(f => ({ ...f, image_url: data.assets[0].secure_url })) } },
      )
      mlRef.current.show()
    }
    if (!document.getElementById(scriptId)) { const s = document.createElement('script'); s.id = scriptId; s.src = 'https://media-library.cloudinary.com/global/all.js'; s.onload = launch; document.head.appendChild(s) } else launch()
  }

  const toggleBrand = (id: number) => setForm(f => ({ ...f, brand_ids: f.brand_ids.includes(id) ? f.brand_ids.filter(b => b !== id) : [...f.brand_ids, id] }))
  const toggleTalent = (id: number) => setForm(f => ({ ...f, talent_ids: f.talent_ids.includes(id) ? f.talent_ids.filter(t => t !== id) : [...f.talent_ids, id] }))

  if (loading) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1.5rem' }}>Manage project showcase sites for the homepage slideshow.</p>

      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={startCreate} style={btnStyle('#111', '#fff')}>+ Add Site</button>
        <span style={{ fontSize: '.82rem', color: '#999' }}>{sites.length} sites</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {sites.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e8e8e4', borderRadius: 8, padding: '.5rem 1rem', background: '#fff' }}>
            {s.image_url ? <img src={s.image_url.replace('/upload/', '/upload/w_80,h_50,c_fill/')} alt="" style={{ width: 60, height: 38, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} /> : <div style={{ width: 60, height: 38, borderRadius: 4, background: '#f0f0ee', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.9rem' }}>{s.title}</strong>
              <p style={{ fontSize: '.75rem', color: '#999' }}>
                {s.brands.length} brands · {s.talents.length} talents · {s.visible ? '✓ Visible' : '○ Hidden'}
              </p>
            </div>
            <span style={{ fontSize: '.75rem', color: '#bbb', flexShrink: 0 }}>#{s.sort_order}</span>
            <div style={{ display: 'flex', gap: '.3rem', flexShrink: 0 }}>
              <button onClick={() => startEdit(s)} style={btnStyle('#f0f0ee', '#666')}>Edit</button>
              <button onClick={() => remove(s.id)} style={btnStyle('#fee', '#c00')}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {(editing || creating) && (
        <AdminModal title={creating ? 'New Site' : `Edit: ${editing!.title}`} onClose={cancel}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            <div>
              <label style={labelStyle}>Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                {form.image_url ? <img src={form.image_url.replace('/upload/', '/upload/w_120,h_70,c_fill/')} alt="" style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 100, height: 60, borderRadius: 6, background: '#f5f5f3' }} />}
                <button onClick={openMediaLibrary} style={btnStyle('#111', '#fff')}>Browse</button>
                {form.image_url && <button onClick={() => setForm(f => ({ ...f, image_url: '' }))} style={btnStyle('#fee', '#c00')}>Remove</button>}
              </div>
            </div>
            <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label style={labelStyle}>URL</label><input style={inputStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." /></div>
            <div><label style={labelStyle}>Story</label><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={4} value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '.75rem' }}>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', marginBottom: 0 }}>
                <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} style={{ width: 16, height: 16 }} />
                Visible
              </label>
              <div><label style={labelStyle}>Order</label><input style={inputStyle} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} /></div>
            </div>

            {/* Brand multi-select */}
            <div>
              <label style={labelStyle}>Brands / Technologies</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {allBrands.map(b => (
                  <button
                    key={b.id}
                    onClick={() => toggleBrand(b.id)}
                    style={{
                      padding: '.3rem .7rem', borderRadius: 20, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
                      border: form.brand_ids.includes(b.id) ? '2px solid #2563eb' : '1px solid #ddd',
                      background: form.brand_ids.includes(b.id) ? '#f0f4ff' : '#fff',
                      color: form.brand_ids.includes(b.id) ? '#2563eb' : '#666',
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Talent multi-select */}
            <div>
              <label style={labelStyle}>Talents / Services</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {allTalents.map(t => (
                  <button
                    key={t.id}
                    onClick={() => toggleTalent(t.id)}
                    style={{
                      padding: '.3rem .7rem', borderRadius: 20, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
                      border: form.talent_ids.includes(t.id) ? '2px solid #2563eb' : '1px solid #ddd',
                      background: form.talent_ids.includes(t.id) ? '#f0f4ff' : '#fff',
                      color: form.talent_ids.includes(t.id) ? '#2563eb' : '#666',
                    }}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
              <button onClick={save} disabled={saving || !form.title.trim()} style={{ ...btnStyle('#2563eb', '#fff'), opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : creating ? 'Create' : 'Save'}</button>
              <button onClick={cancel} style={btnStyle('#f0f0ee', '#666')}>Cancel</button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#999', marginBottom: '.25rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none' }
const btnStyle = (bg: string, color: string): React.CSSProperties => ({ background: bg, color, border: 'none', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' })
