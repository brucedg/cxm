'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { trackEvent } from '@/lib/analytics'

type Template = {
  id: number; name: string; description: string; project_type: string; icon: string
  canvas_nodes: any[]; canvas_edges: any[]; canvas_direction: string
}

export default function NewProjectPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(setTemplates).catch(() => {})
  }, [])

  const create = async (type: 'website' | 'app', template?: Template) => {
    if (!name.trim()) return
    setCreating(true)
    const body: any = { name: name.trim(), project_type: type }
    if (template) {
      body.canvas_nodes = template.canvas_nodes
      body.canvas_edges = template.canvas_edges
      body.canvas_direction = template.canvas_direction
    }
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.id) {
      trackEvent('project_created', { project_type: type, project_id: data.id, template: template?.name || 'blank' })
      router.push(`/projects/${data.id}/design`)
    }
    setCreating(false)
  }

  if (loading || !user) return null

  const websiteTemplates = templates.filter(t => t.project_type === 'website')
  const appTemplates = templates.filter(t => t.project_type === 'app')

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', padding: '6rem 2rem 4rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#111' }}>
            CX<span style={{ color: '#2563eb' }}>M</span>
          </h1>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
            New Project
          </h2>
          <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Name your project, then start from scratch or pick a template.
          </p>

          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.4rem' }}>
            Project name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Company Website Redesign"
            autoFocus
            style={{
              width: '100%', padding: '.75rem 1rem', border: '1px solid #d0d0d0', borderRadius: 10,
              fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', marginBottom: '2rem',
            }}
          />

          {/* Blank project */}
          <p style={{ fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.75rem' }}>
            Start from scratch
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '2rem' }}>
            <button
              onClick={() => create('website')}
              disabled={creating || !name.trim()}
              style={{
                padding: '1.5rem 1rem', borderRadius: 12, border: '2px solid #e8e8e4',
                background: '#fff', cursor: name.trim() ? 'pointer' : 'default',
                transition: 'border-color .2s', opacity: creating ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (name.trim()) e.currentTarget.style.borderColor = '#2563eb' }}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e4'}
            >
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '.5rem' }}>🌐</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.9rem', fontWeight: 600, color: '#111', display: 'block' }}>Blank Website</span>
              <span style={{ fontSize: '.75rem', color: '#999', display: 'block', marginTop: '.2rem' }}>Empty canvas</span>
            </button>
            <button
              onClick={() => create('app')}
              disabled={creating || !name.trim()}
              style={{
                padding: '1.5rem 1rem', borderRadius: 12, border: '2px solid #e8e8e4',
                background: '#fff', cursor: name.trim() ? 'pointer' : 'default',
                transition: 'border-color .2s', opacity: creating ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (name.trim()) e.currentTarget.style.borderColor = '#2563eb' }}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e4'}
            >
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '.5rem' }}>📱</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.9rem', fontWeight: 600, color: '#111', display: 'block' }}>Blank App</span>
              <span style={{ fontSize: '.75rem', color: '#999', display: 'block', marginTop: '.2rem' }}>Empty canvas</span>
            </button>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <>
              <p style={{ fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.75rem' }}>
                Or start from a template
              </p>

              {websiteTemplates.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.75rem', marginBottom: '1rem' }}>
                  {websiteTemplates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => create(t.project_type as 'website' | 'app', t)}
                      disabled={creating || !name.trim()}
                      style={{
                        padding: '1.25rem 1rem', borderRadius: 12,
                        border: selectedTemplate?.id === t.id ? '2px solid #2563eb' : '2px solid #e8e8e4',
                        background: selectedTemplate?.id === t.id ? '#f0f4ff' : '#fff',
                        cursor: name.trim() ? 'pointer' : 'default',
                        transition: 'border-color .2s, background .2s',
                        opacity: creating ? 0.6 : 1, textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (name.trim()) e.currentTarget.style.borderColor = '#2563eb' }}
                      onMouseLeave={e => { if (selectedTemplate?.id !== t.id) e.currentTarget.style.borderColor = '#e8e8e4' }}
                    >
                      <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '.4rem' }}>{t.icon}</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.85rem', fontWeight: 600, color: '#111', display: 'block' }}>{t.name}</span>
                      <span style={{ fontSize: '.72rem', color: '#999', display: 'block', marginTop: '.2rem', lineHeight: 1.4 }}>{t.description.slice(0, 80)}{t.description.length > 80 ? '...' : ''}</span>
                      <span style={{ fontSize: '.68rem', color: '#2563eb', display: 'block', marginTop: '.4rem', fontWeight: 500 }}>
                        {t.canvas_nodes.length - 1} technologies
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {appTemplates.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.75rem' }}>
                  {appTemplates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => create(t.project_type as 'website' | 'app', t)}
                      disabled={creating || !name.trim()}
                      style={{
                        padding: '1.25rem 1rem', borderRadius: 12,
                        border: '2px solid #e8e8e4', background: '#fff',
                        cursor: name.trim() ? 'pointer' : 'default',
                        transition: 'border-color .2s', opacity: creating ? 0.6 : 1, textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (name.trim()) e.currentTarget.style.borderColor = '#2563eb' }}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e4'}
                    >
                      <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '.4rem' }}>{t.icon}</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.85rem', fontWeight: 600, color: '#111', display: 'block' }}>{t.name}</span>
                      <span style={{ fontSize: '.72rem', color: '#999', display: 'block', marginTop: '.2rem', lineHeight: 1.4 }}>{t.description.slice(0, 80)}{t.description.length > 80 ? '...' : ''}</span>
                      <span style={{ fontSize: '.68rem', color: '#2563eb', display: 'block', marginTop: '.4rem', fontWeight: 500 }}>
                        {t.canvas_nodes.length - 1} technologies
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/projects" style={{ fontSize: '.82rem', color: '#999', textDecoration: 'none' }}>Back to projects</a>
          </div>
        </div>
      </div>
    </div>
  )
}
