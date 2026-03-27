'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type Brand = {
  id: number
  name: string
  logo_url: string
  url: string
  description: string
  sort_order: number
}

const empty = { name: '', logo_url: '', url: '', description: '', sort_order: 0 }

export function BrandsAdmin({ authHeader }: { authHeader: string }) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [editing, setEditing] = useState<Brand | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const mlRef = useRef<any>(null)

  const fetchAll = useCallback(async () => {
    const res = await fetch('/api/brands')
    if (res.ok) setBrands(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const startEdit = (b: Brand) => {
    setEditing(b); setCreating(false)
    setForm({ name: b.name, logo_url: b.logo_url, url: b.url, description: b.description, sort_order: b.sort_order })
  }
  const startCreate = () => { setEditing(null); setCreating(true); setForm({ ...empty, sort_order: brands.length + 1 }) }
  const cancel = () => { setEditing(null); setCreating(false); setForm(empty) }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    if (creating) {
      await fetch('/api/brands', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify(form) })
    } else if (editing) {
      await fetch('/api/brands', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify({ id: editing.id, ...form }) })
    }
    await fetchAll(); cancel(); setSaving(false)
  }

  const remove = async (id: number) => {
    await fetch('/api/brands', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify({ id }) })
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
        {
          cloud_name: auth.cloud_name, api_key: auth.api_key,
          timestamp: auth.timestamp, signature: auth.signature,
          folder: { path: 'brands', resource_type: 'image' },
          multiple: false, max_files: 1, insert_caption: 'Select',
        },
        {
          insertHandler: (data: any) => {
            if (data?.assets?.[0]?.secure_url) {
              setForm(f => ({ ...f, logo_url: data.assets[0].secure_url }))
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
      <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1.5rem' }}>
        Manage brand/technology logos shown on the homepage.
      </p>

      {(editing || creating) && (
        <div style={{ border: '1px solid #e8e8e4', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', background: '#f9f9f7' }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            {creating ? 'New Brand' : `Editing: ${editing!.name}`}
          </h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '.75rem' }}>
            {/* Logo preview + browse */}
            <div>
              <label style={labelStyle}>Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                {form.logo_url ? (
                  <img src={form.logo_url} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, background: '#f0f0ee', padding: 4 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '.7rem' }}>?</div>
                )}
                <div>
                  <button onClick={openMediaLibrary} style={btnStyle('#111', '#fff')}>Browse</button>
                  {form.logo_url && <button onClick={() => setForm(f => ({ ...f, logo_url: '' }))} style={{ ...btnStyle('#fee', '#c00'), marginLeft: '.3rem' }}>✕</button>}
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>URL (optional)</label>
              <input style={inputStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Description</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="One-line description" />
            </div>
            <div style={{ width: 80 }}>
              <label style={labelStyle}>Order</label>
              <input style={inputStyle} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button onClick={save} disabled={saving || !form.name.trim()} style={{ ...btnStyle('#2563eb', '#fff'), opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : creating ? 'Create' : 'Save'}</button>
            <button onClick={cancel} style={btnStyle('#f0f0ee', '#666')}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={startCreate} style={btnStyle('#111', '#fff')}>+ Add Brand</button>
        <span style={{ fontSize: '.82rem', color: '#999' }}>{brands.length} brands</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {brands.map(b => (
          <div key={b.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            border: '1px solid #e8e8e4', borderRadius: 8, padding: '.5rem 1rem',
            background: editing?.id === b.id ? '#f0f4ff' : '#fff',
          }}>
            {b.logo_url ? (
              <img src={b.logo_url} alt={b.name} style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 4, background: '#f0f0ee', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '.7rem' }}>?</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.9rem' }}>{b.name}</strong>
              {b.description && <p style={{ fontSize: '.75rem', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.description}</p>}
            </div>
            <span style={{ fontSize: '.75rem', color: '#bbb', flexShrink: 0 }}>#{b.sort_order}</span>
            <div style={{ display: 'flex', gap: '.3rem', flexShrink: 0 }}>
              <button onClick={() => startEdit(b)} style={btnStyle('#f0f0ee', '#666')}>Edit</button>
              <button onClick={() => remove(b.id)} style={btnStyle('#fee', '#c00')}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#999', marginBottom: '.25rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none' }
const btnStyle = (bg: string, color: string): React.CSSProperties => ({ background: bg, color, border: 'none', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' })
