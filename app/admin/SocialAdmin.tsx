'use client'

import { useState, useEffect, useCallback } from 'react'

type SocialChannel = { name: string; url: string }

export function SocialAdmin({ authHeader }: { authHeader: string }) {
  const [channels, setChannels] = useState<SocialChannel[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch('/api/settings?key=social_channels')
      if (res.ok) setChannels(await res.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchChannels() }, [fetchChannels])

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({ key: 'social_channels', value: channels }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const update = (i: number, field: keyof SocialChannel, value: string) => {
    setChannels(prev => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next })
  }

  if (loading) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: '#999', marginBottom: '1.5rem' }}>Manage social media links shown on the site.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.5rem' }}>
        {channels.map((ch, i) => (
          <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', border: '1px solid #e8e8e4', borderRadius: 8, padding: '.5rem .75rem' }}>
            <input style={inputStyle} value={ch.name} onChange={e => update(i, 'name', e.target.value)} placeholder="e.g. LinkedIn" />
            <input style={{ ...inputStyle, flex: 2 }} value={ch.url} onChange={e => update(i, 'url', e.target.value)} placeholder="https://..." />
            <button onClick={() => setChannels(prev => prev.filter((_, j) => j !== i))} style={{ background: '#fee', color: '#c00', border: 'none', borderRadius: 6, padding: '.3rem .6rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
        <button onClick={() => setChannels(prev => [...prev, { name: '', url: '' }])} style={btnStyle('#111', '#fff')}>+ Add Channel</button>
        <button onClick={save} disabled={saving} style={{ ...btnStyle('#2563eb', '#fff'), opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
        {saved && <span style={{ color: '#2563eb', fontSize: '.85rem', fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { flex: 1, padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none' }
const btnStyle = (bg: string, color: string): React.CSSProperties => ({ background: bg, color, border: 'none', borderRadius: 4, padding: '.5rem 1.2rem', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' })
