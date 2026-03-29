'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { trackEvent } from '@/lib/analytics'

export default function NewProjectPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  const create = async (type: 'website' | 'app') => {
    if (!name.trim()) return
    setCreating(true)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), project_type: type }),
    })
    const data = await res.json()
    if (data.id) {
      trackEvent('project_created', { project_type: type, project_id: data.id })
      router.push(`/projects/${data.id}/design`)
    }
    setCreating(false)
  }

  if (loading || !user) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '2rem' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#111' }}>
            CX<span style={{ color: '#2563eb' }}>M</span>
          </h1>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', border: '1px solid #e8e8e4' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 600, color: '#111', marginBottom: '.5rem' }}>
            New Project
          </h2>
          <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Name your project and choose what you're building.
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

          <p style={{ fontSize: '.75rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: '.75rem' }}>
            What are you building?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              onClick={() => create('website')}
              disabled={creating || !name.trim()}
              style={{
                padding: '2rem 1.5rem', borderRadius: 14, border: '2px solid #e8e8e4',
                background: '#fff', cursor: name.trim() ? 'pointer' : 'default',
                transition: 'border-color .2s, box-shadow .2s',
                opacity: creating ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (name.trim()) e.currentTarget.style.borderColor = '#2563eb' }}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e4'}
            >
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.75rem' }}>🌐</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 600, color: '#111', display: 'block' }}>Website</span>
              <span style={{ fontSize: '.78rem', color: '#999', marginTop: '.25rem', display: 'block' }}>Marketing site, SaaS, blog, e-commerce</span>
            </button>

            <button
              onClick={() => create('app')}
              disabled={creating || !name.trim()}
              style={{
                padding: '2rem 1.5rem', borderRadius: 14, border: '2px solid #e8e8e4',
                background: '#fff', cursor: name.trim() ? 'pointer' : 'default',
                transition: 'border-color .2s, box-shadow .2s',
                opacity: creating ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (name.trim()) e.currentTarget.style.borderColor = '#2563eb' }}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e4'}
            >
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.75rem' }}>📱</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 600, color: '#111', display: 'block' }}>App</span>
              <span style={{ fontSize: '.78rem', color: '#999', marginTop: '.25rem', display: 'block' }}>Mobile app, desktop app, PWA</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/projects" style={{ fontSize: '.82rem', color: '#999', textDecoration: 'none' }}>Back to projects</a>
          </div>
        </div>
      </div>
    </div>
  )
}
