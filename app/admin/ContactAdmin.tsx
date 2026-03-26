'use client'

import { useState, useEffect, useCallback } from 'react'

type Contact = { email: string; location: string; availability: string; responseTime: string }

const empty: Contact = { email: '', location: '', availability: '', responseTime: '' }

export function ContactAdmin({ authHeader }: { authHeader: string }) {
  const [form, setForm] = useState<Contact>(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings?key=contact').then(r => r.json()).then(setForm).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({ key: 'contact', value: form }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  if (loading) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1.5rem' }}>Edit contact details shown on the site.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.5rem' }}>
        {([
          ['email', 'Email'],
          ['location', 'Location'],
          ['availability', 'Availability'],
          ['responseTime', 'Response Time'],
        ] as [keyof Contact, string][]).map(([key, label]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input style={inputStyle} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
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
