'use client'

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react'
import { AdminModal } from './AdminModal'

type Technology = {
  id: number; name: string; category: string; categories: string[]; svg_logo: string; svg_logo_color: string; color: string
  logo_url: string; url: string; description: string; tags: string[]; sort_order: number; is_active: boolean
  pricing_tier: string; monthly_cost_usd: number | null
}

const CATEGORIES = [
  'AI Tools', 'API', 'Analytics', 'Authentication', 'Build Tools', 'CDN', 'CI/CD', 'CMS',
  'CSS Framework', 'Code Editor', 'Collaboration', 'Containerisation', 'Database', 'Design',
  'Ecommerce', 'Email', 'Frontend Framework', 'Hosting', 'Image / Media', 'Language',
  'Marketing', 'Monitoring', 'Payment', 'Personalisation', 'Repository', 'Search', 'Testing', 'Virtualisation',
]

const empty = { name: '', categories: [] as string[], svg_logo: '', svg_logo_color: '', color: '', logo_url: '', url: '', description: '', tags: [] as string[], sort_order: 0, pricing_tier: 'free', monthly_cost_usd: null as number | null }

export function TechnologiesAdmin({ authHeader }: { authHeader: string }) {
  const [techs, setTechs] = useState<Technology[]>([])
  const [editing, setEditing] = useState<Technology | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'order'>('name')
  const [page, setPage] = useState(1)
  const perPage = 30
  const [tagsInput, setTagsInput] = useState('')
  const svgInputRef = useRef<HTMLInputElement>(null)
  const svgColorInputRef = useRef<HTMLInputElement>(null)

  const fetchAll = useCallback(async () => {
    const res = await fetch('/api/technologies')
    if (res.ok) setTechs(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const startEdit = (t: Technology) => {
    setEditing(t); setCreating(false)
    setForm({ name: t.name, categories: t.categories || [t.category].filter(Boolean), svg_logo: t.svg_logo, svg_logo_color: t.svg_logo_color || '', color: t.color, logo_url: t.logo_url, url: t.url, description: t.description, tags: t.tags || [], sort_order: t.sort_order, pricing_tier: t.pricing_tier || 'free', monthly_cost_usd: t.monthly_cost_usd })
    setTagsInput((t.tags || []).join(', '))
  }
  const startCreate = () => { setEditing(null); setCreating(true); setForm({ ...empty, sort_order: techs.length + 1 }); setTagsInput('') }
  const cancel = () => { setEditing(null); setCreating(false); setForm(empty); setTagsInput('') }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = { ...form, categories: form.categories, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) }
    if (creating) {
      await fetch('/api/technologies', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify(payload) })
    } else if (editing) {
      await fetch('/api/technologies', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify({ id: editing.id, ...payload }) })
    }
    await fetchAll(); cancel(); setSaving(false)
  }

  const remove = async (id: number) => {
    await fetch('/api/technologies', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify({ id }) })
    await fetchAll(); if (editing?.id === id) cancel()
  }

  const handleSvgUpload = (field: 'svg_logo' | 'svg_logo_color') => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      alert('Please select an SVG file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const svg = reader.result as string
      setForm(f => ({ ...f, [field]: svg }))
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [search, filterCat, sortBy])

  const filtered = (() => {
    let list = techs.filter(t => {
      if (filterCat && !(t.categories || []).includes(filterCat)) return false
      if (search) {
        const q = search.toLowerCase()
        return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || (t.tags || []).some(tag => tag.includes(q))
      }
      return true
    })
    switch (sortBy) {
      case 'category': return [...list].sort((a, b) => (a.categories?.[0] || '').localeCompare(b.categories?.[0] || '') || a.name.localeCompare(b.name))
      case 'order': return [...list].sort((a, b) => a.sort_order - b.sort_order)
      default: return [...list].sort((a, b) => a.name.localeCompare(b.name))
    }
  })()

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  if (loading) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1rem' }}>
        Manage technologies for the project builder. {techs.length} total across {CATEGORIES.length} categories.
      </p>

      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search technologies..."
          style={{ flex: '1 1 180px', padding: '.4rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.85rem', outline: 'none', minWidth: 140 }}
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '.4rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.85rem', background: '#fff', cursor: 'pointer' }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ padding: '.4rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.85rem', background: '#fff', cursor: 'pointer' }}>
          <option value="name">Sort: Name</option>
          <option value="category">Sort: Category</option>
          <option value="order">Sort: Order</option>
        </select>
        <button onClick={startCreate} style={btnStyle('#111', '#fff')}>+ Add Technology</button>
        <span style={{ fontSize: '.82rem', color: '#999' }}>{filtered.length} total · page {page}/{totalPages}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
        {paged.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', border: '1px solid #e8e8e4', borderRadius: 8, padding: '.4rem .75rem', background: '#fff' }}>
            <div style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.svg_logo ? (
                <div style={{ width: 22, height: 22, color: t.color || '#666' }} dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
              ) : t.logo_url ? (
                <img src={t.logo_url} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: 4, background: '#f0f0ee' }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.85rem' }}>{t.name}</strong>
            </div>
            <div style={{ display: 'flex', gap: '.2rem', flexShrink: 0, flexWrap: 'wrap' }}>
              {(t.categories || []).map(c => (
                <span key={c} style={{ fontSize: '.65rem', color: '#666', background: '#f4f4f8', padding: '.1rem .4rem', borderRadius: 4, whiteSpace: 'nowrap' }}>{c}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '.25rem', flexShrink: 0 }}>
              <button onClick={() => startEdit(t)} style={btnStyle('#f0f0ee', '#666')}>Edit</button>
              <button onClick={() => remove(t.id)} style={btnStyle('#fee', '#c00')}>Del</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem', marginTop: '1rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btnStyle(page === 1 ? '#f5f5f3' : '#fff', page === 1 ? '#ccc' : '#666'), border: '1px solid #ddd', fontSize: '.78rem' }}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{ ...btnStyle(page === n ? '#111' : 'transparent', page === n ? '#fff' : '#666'), fontSize: '.78rem', minWidth: 28 }}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...btnStyle(page === totalPages ? '#f5f5f3' : '#fff', page === totalPages ? '#ccc' : '#666'), border: '1px solid #ddd', fontSize: '.78rem' }}>Next ›</button>
        </div>
      )}

      {(editing || creating) && (
        <AdminModal title={creating ? 'New Technology' : `Edit: ${editing!.name}`} onClose={cancel}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {/* Logo preview */}
            <div>
              <label style={labelStyle}>Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                {form.svg_logo ? (
                  <div style={{ width: 48, height: 48, color: form.color || '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3', borderRadius: 8, padding: 8 }} dangerouslySetInnerHTML={{ __html: form.svg_logo }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '.75rem' }}>SVG</div>
                )}
                <input ref={svgInputRef} type="file" accept=".svg,image/svg+xml" onChange={handleSvgUpload('svg_logo')} style={{ display: 'none' }} />
                <button onClick={() => svgInputRef.current?.click()} style={btnStyle('#111', '#fff')}>Upload SVG</button>
                {form.svg_logo && (
                  <>
                    <button onClick={() => {
                      const blob = new Blob([form.svg_logo], { type: 'image/svg+xml' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = `${form.name || 'logo'}.svg`; a.click()
                      URL.revokeObjectURL(url)
                    }} style={btnStyle('#f5f5f3', '#333')}>Download</button>
                    <button onClick={() => setForm(f => ({ ...f, svg_logo: '' }))} style={btnStyle('#fee', '#c00')}>Remove</button>
                  </>
                )}
              </div>
            </div>

            {/* Colour Logo */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Colour Logo (optional)</label>
              <p style={{ fontSize: '.72rem', color: '#999', marginBottom: '.4rem' }}>Full-colour SVG with hardcoded fills. Used in popovers, canvas, and PDFs.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                {form.svg_logo_color ? (
                  <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3', borderRadius: 8, padding: 8 }} dangerouslySetInnerHTML={{ __html: form.svg_logo_color }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '.65rem' }}>Color</div>
                )}
                <input ref={svgColorInputRef} type="file" accept=".svg,image/svg+xml" onChange={handleSvgUpload('svg_logo_color')} style={{ display: 'none' }} />
                <button onClick={() => svgColorInputRef.current?.click()} style={btnStyle('#111', '#fff')}>Upload Colour SVG</button>
                {form.svg_logo_color && (
                  <>
                    <button onClick={() => {
                      const blob = new Blob([form.svg_logo_color], { type: 'image/svg+xml' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = `${form.name || 'logo'}-color.svg`; a.click()
                      URL.revokeObjectURL(url)
                    }} style={btnStyle('#f5f5f3', '#333')}>Download</button>
                    <button onClick={() => setForm(f => ({ ...f, svg_logo_color: '' }))} style={btnStyle('#fee', '#c00')}>Remove</button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div>
                <label style={labelStyle}>Categories</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', padding: '.4rem .5rem', border: '1px solid #ddd', borderRadius: 6, minHeight: 38, alignItems: 'center' }}>
                  {form.categories.map(c => (
                    <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', background: '#e8e8ff', color: '#333', padding: '.15rem .5rem', borderRadius: 4, fontSize: '.75rem', fontWeight: 500 }}>
                      {c}
                      <button onClick={() => setForm(f => ({ ...f, categories: f.categories.filter(x => x !== c) }))} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '.7rem', padding: 0, lineHeight: 1 }}>✕</button>
                    </span>
                  ))}
                  <select
                    value=""
                    onChange={e => {
                      const v = e.target.value
                      if (v && !form.categories.includes(v)) setForm(f => ({ ...f, categories: [...f.categories, v] }))
                      e.target.value = ''
                    }}
                    style={{ border: 'none', outline: 'none', fontSize: '.78rem', color: '#999', background: 'transparent', cursor: 'pointer', flex: '1 1 100px', minWidth: 80 }}
                  >
                    <option value="">+ add category</option>
                    {CATEGORIES.filter(c => !form.categories.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div><label style={labelStyle}>Description</label><input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="One-line description" /></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: '.75rem' }}>
              <div><label style={labelStyle}>URL</label><input style={inputStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." /></div>
              <div><label style={labelStyle}>Order</label><input style={inputStyle} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} /></div>
              <div>
                <label style={labelStyle}>Color</label>
                <div style={{ display: 'flex', gap: '.25rem', alignItems: 'center' }}>
                  <input type="color" value={form.color || '#666666'} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer' }} />
                  <input style={{ ...inputStyle, width: 60, fontSize: '.75rem' }} value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="#hex" />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div>
                <label style={labelStyle}>Pricing Tier</label>
                <select style={inputStyle} value={form.pricing_tier} onChange={e => setForm(f => ({ ...f, pricing_tier: e.target.value }))}>
                  <option value="free">Free / Open Source</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Monthly Cost (USD)</label>
                <input style={inputStyle} type="number" step="0.01" value={form.monthly_cost_usd ?? ''} onChange={e => setForm(f => ({ ...f, monthly_cost_usd: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="0.00" />
              </div>
            </div>

            <div><label style={labelStyle}>Tags (comma-separated)</label><input style={inputStyle} value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="frontend, react, ui" /></div>

            <div>
              <label style={labelStyle}>SVG Logo (raw)</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '.75rem' }} rows={3} value={form.svg_logo} onChange={e => setForm(f => ({ ...f, svg_logo: e.target.value }))} placeholder="<svg>...</svg>" />
            </div>

            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
              <button onClick={save} disabled={saving || !form.name.trim()} style={{ ...btnStyle('#2563eb', '#fff'), opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : creating ? 'Create' : 'Save'}</button>
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
