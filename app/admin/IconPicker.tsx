'use client'

import { useState } from 'react'
import * as icons from 'lucide-react'

// Curated list of useful icons for a consultancy
const ICON_NAMES = [
  'LayoutGrid', 'Code2', 'Monitor', 'BarChart3', 'Sun', 'Grid2x2',
  'Rocket', 'Zap', 'Target', 'TrendingUp', 'Layers', 'Palette',
  'Globe', 'Database', 'Shield', 'Users', 'MessageSquare', 'Settings',
  'Search', 'Star', 'Heart', 'Award', 'Briefcase', 'Coffee',
  'Lightbulb', 'PenTool', 'Camera', 'Music', 'Video', 'Smartphone',
  'Tablet', 'Laptop', 'Server', 'Cloud', 'Lock', 'Unlock',
  'Eye', 'FileText', 'FolderOpen', 'GitBranch', 'Terminal', 'Cpu',
  'Wifi', 'Share2', 'Link', 'Mail', 'Phone', 'MapPin',
  'Calendar', 'Clock', 'CheckCircle', 'AlertCircle', 'Info', 'HelpCircle',
  'ArrowRight', 'ChevronRight', 'ExternalLink', 'Download', 'Upload', 'RefreshCw',
  'Gauge', 'Wrench', 'Hammer', 'Puzzle', 'Boxes', 'Package',
  'BarChart', 'PieChart', 'LineChart', 'Activity', 'Sparkles', 'Wand2',
]

function getIcon(name: string) {
  return (icons as any)[name] || icons.Star
}

export function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search
    ? ICON_NAMES.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : ICON_NAMES

  const CurrentIcon = getIcon(value)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 44, height: 44, borderRadius: 8, background: '#111',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}
      >
        <CurrentIcon size={20} color="#fff" strokeWidth={1.5} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8,
          background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,.15)', padding: '1rem',
          width: 320, maxHeight: 400, zIndex: 100,
        }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search icons..."
            autoFocus
            style={{
              width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd',
              borderRadius: 6, fontSize: '.85rem', marginBottom: '.75rem', outline: 'none',
            }}
          />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4,
            maxHeight: 280, overflowY: 'auto',
          }}>
            {filtered.map(name => {
              const Icon = getIcon(name)
              return (
                <button
                  key={name}
                  onClick={() => { onChange(name); setOpen(false); setSearch('') }}
                  title={name}
                  style={{
                    width: 34, height: 34, borderRadius: 6, border: 'none',
                    background: value === name ? '#2563eb' : '#f5f5f3',
                    color: value === name ? '#fff' : '#555',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background .15s',
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && <p style={{ color: '#999', fontSize: '.82rem', textAlign: 'center' }}>No icons found</p>}
        </div>
      )}
    </div>
  )
}
