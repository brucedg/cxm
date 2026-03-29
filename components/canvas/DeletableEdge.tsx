'use client'

import { useState, useCallback } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react'

export function DeletableEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected, data,
}: EdgeProps) {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  })

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }, [])

  const onDisconnect = data?.onDisconnect as ((id: string) => void) | undefined
  const onReverse = data?.onReverse as ((id: string) => void) | undefined

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#2563eb' : '#b0b0b0',
          strokeWidth: selected ? 2 : 1.5,
          cursor: 'pointer',
        }}
      />
      {/* Invisible wider click target */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onContextMenu={onContextMenu}
        style={{ cursor: 'context-menu' }}
      />
      {menuPos && (
        <EdgeLabelRenderer>
          <div
            className="edge-context-menu"
            style={{ left: menuPos.x, top: menuPos.y }}
            onClick={() => setMenuPos(null)}
          >
            {onReverse && (
              <button onClick={() => { onReverse(id); setMenuPos(null) }}>
                Reverse direction
              </button>
            )}
            {onDisconnect && (
              <button className="danger" onClick={() => { onDisconnect(id); setMenuPos(null) }}>
                Disconnect
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
