'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with React Flow
const ProjectCanvas = dynamic(
  () => import('@/components/canvas/ProjectCanvas').then(m => ({ default: m.ProjectCanvas })),
  { ssr: false, loading: () => <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#999' }}>Loading canvas...</p></div> }
)

type Project = {
  id: number
  name: string
  project_type: 'website' | 'app'
  canvas_nodes: any[]
  canvas_edges: any[]
  canvas_direction: string
  status: string
}

export default function DesignPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = parseInt(params.id as string)

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user) return

    fetch(`/api/projects/${projectId}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => { setProject(data); setLoading(false) })
      .catch(() => { setError('Project not found'); setLoading(false) })
  }, [authLoading, user, projectId, router])

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
        <p style={{ color: '#999' }}>Loading...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error || 'Project not found'}</p>
          <a href="/projects" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Back to projects</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal header */}
      <div style={{
        height: 48, padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '1rem',
        background: '#fff', borderBottom: '1px solid #e8e8e4', flexShrink: 0,
      }}>
        <a href="/projects" style={{ color: '#999', textDecoration: 'none', fontSize: '.82rem' }}>← Projects</a>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '.9rem', color: '#111' }}>
          {project.name}
        </span>
        <span style={{ fontSize: '.75rem', color: '#999', background: '#f4f4f8', padding: '.15rem .5rem', borderRadius: 4 }}>
          {project.project_type}
        </span>
      </div>

      <ProjectCanvas
        projectId={project.id}
        projectName={project.name}
        projectType={project.project_type}
        initialNodes={project.canvas_nodes || []}
        initialEdges={project.canvas_edges || []}
        initialDirection={(project.canvas_direction as 'TB' | 'LR') || 'TB'}
      />
    </div>
  )
}
