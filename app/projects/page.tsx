'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

type Project = {
  id: number; name: string; project_type: string; status: string
  created_at: string; updated_at: string
}

export default function ProjectsPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(data); setLoadingProjects(false) })
      .catch(() => setLoadingProjects(false))
  }, [user])

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', padding: '6rem 2rem 4rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: '#111' }}>
              Your Projects
            </h1>
            <p style={{ color: '#666', fontSize: '.88rem', marginTop: '.25rem' }}>
              Welcome{user.displayName ? `, ${user.displayName}` : ''} — build your technology stack.
            </p>
          </div>
          <button
            onClick={() => router.push('/projects/new')}
            style={{
              padding: '.7rem 1.5rem', borderRadius: 10, border: 'none',
              background: '#111', color: '#fff', fontSize: '.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            + New Project
          </button>
        </div>

        {loadingProjects ? (
          <p style={{ color: '#999' }}>Loading projects...</p>
        ) : projects.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e8e8e4',
            padding: '4rem 2rem', textAlign: 'center', color: '#999',
          }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🏗️</p>
            <p style={{ fontSize: '.95rem' }}>No projects yet. Create your first one to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => router.push(`/projects/${p.id}/design`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: '#fff', borderRadius: 12, border: '1px solid #e8e8e4',
                  padding: '1rem 1.25rem', cursor: 'pointer',
                  transition: 'border-color .15s, box-shadow .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,99,235,.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e4'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: '1.5rem' }}>{p.project_type === 'app' ? '📱' : '🌐'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '.95rem', color: '#111' }}>{p.name}</strong>
                  <p style={{ fontSize: '.78rem', color: '#999', marginTop: '.15rem' }}>
                    {p.project_type} · {p.status} · updated {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={{ color: '#ccc', fontSize: '1.2rem' }}>→</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={async () => { await logout(); router.push('/login') }}
            style={{ background: 'none', border: 'none', color: '#999', fontSize: '.82rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
