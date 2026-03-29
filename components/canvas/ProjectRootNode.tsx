'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface ProjectRootData {
  label: string
  icon: string
  projectType?: 'website' | 'app'
  isRoot: true
  direction?: 'TB' | 'LR'
  [key: string]: unknown
}

export const ProjectRootNode = memo(function ProjectRootNode({ data }: NodeProps) {
  const d = data as ProjectRootData
  const dir = d.direction || 'TB'
  const icon = d.projectType === 'app' ? '📱' : '🌐'

  return (
    <div className="project-root-node">
      <div className="project-root-content">
        <span className="project-root-icon">{icon}</span>
        <span className="project-root-label">{d.label}</span>
      </div>

      <Handle
        type="source"
        position={dir === 'TB' ? Position.Bottom : Position.Right}
        className="tech-handle root-handle"
      />
    </div>
  )
})
