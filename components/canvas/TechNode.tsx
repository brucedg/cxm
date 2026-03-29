'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface TechNodeData {
  label: string
  icon: string
  category?: string
  color?: string
  svgLogo?: string
  isRoot?: boolean
  direction?: 'TB' | 'LR'
  [key: string]: unknown
}

export const TechNode = memo(function TechNode({ data, selected }: NodeProps) {
  const d = data as TechNodeData
  const dir = d.direction || 'TB'
  const color = d.color || '#666'

  return (
    <div
      className={`tech-node${selected ? ' selected' : ''}`}
      style={{ borderLeftColor: color }}
    >
      <Handle
        type="target"
        position={dir === 'TB' ? Position.Top : Position.Left}
        className="tech-handle"
      />

      <div className="tech-node-content">
        <div className="tech-node-icon" style={{ color }}>
          {d.svgLogo ? (
            <div dangerouslySetInnerHTML={{ __html: d.svgLogo }} />
          ) : (
            <span style={{ fontSize: 16 }}>📦</span>
          )}
        </div>
        <div className="tech-node-info">
          <span className="tech-node-name">{d.label}</span>
          {d.category && <span className="tech-node-category">{d.category}</span>}
        </div>
      </div>

      <Handle
        type="source"
        position={dir === 'TB' ? Position.Bottom : Position.Right}
        className="tech-handle"
      />
    </div>
  )
})
