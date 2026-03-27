'use client'

import { useState, useEffect, useCallback } from 'react'
import { IconPicker } from './IconPicker'
import { AdminModal } from './AdminModal'

type Talent = {
  id: number
  title: string
  description: string
  tag: string
  icon: string
  sort_order: number
}

const empty = { title: '', description: '', tag: '', icon: 'Star', sort_order: 0 }

export function TalentsAdmin({ authHeader }: { authHeader: string }) {
  const [talents, setTalents] = useState<Talent[]>([])
  const [editing, setEditing] = useState<Talent | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const res = await fetch('/api/talents')
    if (res.ok) setTalents(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const startEdit = (t: Talent) => {
    setEditing(t); setCreating(false)
    setForm({ title: t.title, description: t.description, tag: t.tag, icon: t.icon, sort_order: t.sort_order })
  }

  const startCreate = () => { setEditing(null); setCreating(true); setForm({ ...empty, sort_order: talents.length + 1 }) }
  const cancel = () => { setEditing(null); setCreating(false); setForm(empty) }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    if (creating) {
      await fetch('/api/talents', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify(form) })
    } else if (editing) {
      await fetch('/api/talents', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify({ id: editing.id, ...form }) })
    }
    await fetchAll(); cancel(); setSaving(false)
  }

  const remove = async (id: number) => {
    await fetch('/api/talents', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: authHeader }, body: JSON.stringify({ id }) })
    await fetchAll(); if (editing?.id === id) cancel()
  }

  if (loading) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1.5rem' }}>
        Manage the talent/service cards shown on the homepage. Drag to reorder by changing the sort number.
      </p>

      {/* Edit/Create Modal */}
      {(editing || creating) && (
        <AdminModal title={creating ? 'New Talent' : `Edit: ${editing!.title}`} onClose={cancel}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Icon</label>
                <IconPicker value={form.icon} onChange={icon => setForm(f => ({ ...f, icon }))} />
              </div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Title *</label><input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '.75rem' }}>
              <div><label style={labelStyle}>Tag</label><input style={inputStyle} value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="e.g. Strategy + Build" /></div>
              <div><label style={labelStyle}>Order</label><input style={inputStyle} type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
              <button onClick={save} disabled={saving || !form.title.trim()} style={{ ...btnStyle('#2563eb', '#fff'), opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : creating ? 'Create' : 'Save'}</button>
              <button onClick={cancel} style={btnStyle('#f0f0ee', '#666')}>Cancel</button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Add button */}
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={startCreate} style={btnStyle('#111', '#fff')}>+ Add Talent</button>
        <span style={{ fontSize: '.82rem', color: '#999' }}>{talents.length} talents</span>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {talents.map(t => {
          const Icon = require('lucide-react')[t.icon] || require('lucide-react').Star
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              border: '1px solid #e8e8e4', borderRadius: 8, padding: '.6rem 1rem',
              background: editing?.id === t.id ? '#f0f4ff' : '#fff',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="#fff" strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.9rem' }}>{t.title}</strong>
                <p style={{ fontSize: '.78rem', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.description}
                </p>
              </div>
              <span style={{ fontSize: '.7rem', color: '#2563eb', background: '#f0f4ff', padding: '2px 8px', borderRadius: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', flexShrink: 0 }}>{t.tag}</span>
              <span style={{ fontSize: '.75rem', color: '#bbb', flexShrink: 0 }}>#{t.sort_order}</span>
              <div style={{ display: 'flex', gap: '.3rem', flexShrink: 0 }}>
                <button onClick={() => startEdit(t)} style={btnStyle('#f0f0ee', '#666')}>Edit</button>
                <button onClick={() => remove(t.id)} style={btnStyle('#fee', '#c00')}>Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#999', marginBottom: '.25rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none' }
const btnStyle = (bg: string, color: string): React.CSSProperties => ({ background: bg, color, border: 'none', borderRadius: 4, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer' })
