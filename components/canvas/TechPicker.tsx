'use client'

import { useState, useEffect, useCallback } from 'react'

type Technology = {
  id: number; name: string; category: string; categories: string[]; svg_logo: string; color: string
}

type Props = {
  onPick: (techs: Technology[]) => void
  onClose: () => void
  existingIds: Set<number>
}

const CATEGORIES = [
  'AI Tools', 'API', 'Analytics', 'Authentication', 'Build Tools', 'CDN', 'CI/CD', 'CMS',
  'CSS Framework', 'Code Editor', 'Collaboration', 'Containerisation', 'Database', 'Design',
  'Ecommerce', 'Email', 'Frontend Framework', 'Hosting', 'Image / Media', 'Language',
  'Marketing', 'Monitoring', 'Payment', 'Personalisation', 'Repository', 'Search', 'Testing', 'Virtualisation',
]

export function TechPicker({ onPick, onClose, existingIds }: Props) {
  const [all, setAll] = useState<Technology[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/technologies')
      .then(r => r.json())
      .then(data => { setAll(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = all.filter(t => {
    if (existingIds.has(t.id)) return false
    if (activeTab !== 'All' && !(t.categories || [t.category]).includes(activeTab)) return false
    if (search) {
      const q = search.toLowerCase()
      return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    }
    return true
  })

  const toggle = useCallback((id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const confirm = () => {
    const picked = all.filter(t => selected.has(t.id))
    onPick(picked)
    onClose()
  }

  // Categories that have items available
  const availableCats = ['All', ...CATEGORIES.filter(c => all.some(t => (t.categories || [t.category]).includes(c) && !existingIds.has(t.id)))]

  return (
    <div className="tech-picker-overlay" onClick={onClose}>
      <div className="tech-picker" onClick={e => e.stopPropagation()}>
        <div className="tech-picker-header">
          <h3>Add Technologies</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        <div className="tech-picker-tabs">
          {availableCats.map(cat => (
            <button
              key={cat}
              className={`tech-picker-tab${activeTab === cat ? ' active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="tech-picker-search">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search technologies..."
            autoFocus
          />
        </div>

        <div className="tech-picker-list">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              {search ? `No results for "${search}"` : 'All technologies in this category are already on canvas'}
            </p>
          ) : (
            filtered.map(t => (
              <div
                key={t.id}
                className={`tech-picker-item${selected.has(t.id) ? ' selected' : ''}`}
                onClick={() => toggle(t.id)}
              >
                <div className="tech-picker-item-icon" style={{ color: t.color || '#666' }}>
                  {t.svg_logo ? (
                    <div dangerouslySetInnerHTML={{ __html: t.svg_logo }} />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="tech-picker-item-info">
                  <span className="tech-picker-item-name">{t.name}</span>
                  <span className="tech-picker-item-cat">{t.category}</span>
                </div>
                {selected.has(t.id) && <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span>}
              </div>
            ))
          )}
        </div>

        <div className="tech-picker-footer">
          <span style={{ fontSize: '.82rem', color: '#999' }}>{selected.size} selected</span>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button onClick={onClose} style={{ padding: '.4rem 1rem', borderRadius: 6, border: '1px solid #ddd', background: '#fff', fontSize: '.82rem', cursor: 'pointer' }}>Cancel</button>
            <button
              onClick={confirm}
              disabled={selected.size === 0}
              style={{
                padding: '.4rem 1rem', borderRadius: 6, border: 'none',
                background: selected.size > 0 ? '#111' : '#ccc', color: '#fff',
                fontSize: '.82rem', fontWeight: 600, cursor: selected.size > 0 ? 'pointer' : 'default',
              }}
            >
              Add {selected.size > 0 ? `(${selected.size})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
