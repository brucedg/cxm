'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import { trackEvent } from '@/lib/analytics'
import { TechNode } from './TechNode'
import { ProjectRootNode } from './ProjectRootNode'
import { DeletableEdge } from './DeletableEdge'
import { TechPicker } from './TechPicker'
import './canvas.css'

const NODE_W = 240
const NODE_H = 60

const nodeTypes = { tech: TechNode, root: ProjectRootNode }
const edgeTypes = { deletable: DeletableEdge }

function autoArrange(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB'): Node[] {
  if (!nodes.length) return []
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100, align: 'UL' })
  for (const n of nodes) {
    const w = (n.measured as any)?.width ?? NODE_W
    const h = (n.measured as any)?.height ?? NODE_H
    g.setNode(n.id, { width: w, height: h })
  }
  for (const e of edges) g.setEdge(e.source, e.target)
  dagre.layout(g)

  const srcPos = direction === 'TB' ? Position.Bottom : Position.Right
  const tgtPos = direction === 'TB' ? Position.Top : Position.Left

  return nodes.map(n => {
    const p = g.node(n.id)
    if (!p) return n
    const w = (n.measured as any)?.width ?? NODE_W
    const h = (n.measured as any)?.height ?? NODE_H
    return {
      ...n,
      position: { x: p.x - w / 2, y: p.y - h / 2 },
      sourcePosition: srcPos,
      targetPosition: tgtPos,
      data: { ...n.data, direction },
    }
  })
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  projectId: number
  projectName: string
  projectType: 'website' | 'app'
  initialNodes: Node[]
  initialEdges: Edge[]
  initialDirection?: 'TB' | 'LR'
}

function Canvas({ projectId, projectName, projectType, initialNodes, initialEdges, initialDirection = 'TB' }: Props) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [direction, setDirection] = useState<'TB' | 'LR'>(initialDirection)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const { fitView } = useReactFlow()

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirtyRef = useRef(false)
  const undoStack = useRef<{ nodes: Node[]; edges: Edge[] }[]>([])

  // Initialize with root node if empty
  useEffect(() => {
    if (initialNodes.length === 0) {
      const rootNode: Node = {
        id: 'root',
        type: 'root',
        position: { x: 0, y: 0 },
        data: { label: projectName, icon: '', projectType, isRoot: true, direction },
        draggable: false,
      }
      setNodes([rootNode])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-arrange on first render
  useEffect(() => {
    if (nodes.length > 0) {
      const arranged = autoArrange(nodes, edges, direction)
      setNodes(arranged)
      setTimeout(() => fitView({ padding: 0.2 }), 100)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save with debounce
  const triggerSave = useCallback(() => {
    dirtyRef.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      if (!dirtyRef.current) return
      setSaveStatus('saving')
      try {
        const res = await fetch(`/api/projects/${projectId}/auto-save`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            canvas_nodes: nodes,
            canvas_edges: edges,
            canvas_direction: direction,
          }),
        })
        if (res.ok) {
          dirtyRef.current = false
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus(s => s === 'saved' ? 'idle' : s), 2000)
        } else {
          setSaveStatus('error')
        }
      } catch {
        setSaveStatus('error')
      }
    }, 2000)
  }, [projectId, nodes, edges, direction])

  // Save on every change
  useEffect(() => { triggerSave() }, [nodes, edges, direction])

  // Undo
  const pushUndo = useCallback(() => {
    undoStack.current.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) })
    if (undoStack.current.length > 20) undoStack.current.shift()
  }, [nodes, edges])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        const prev = undoStack.current.pop()
        if (prev) {
          const arranged = autoArrange(prev.nodes, prev.edges, direction)
          setNodes(arranged)
          setEdges(prev.edges)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [direction])

  // sendBeacon on unload
  useEffect(() => {
    const handler = () => {
      if (dirtyRef.current) {
        navigator.sendBeacon(`/api/projects/${projectId}/auto-save`, JSON.stringify({
          canvas_nodes: nodes, canvas_edges: edges, canvas_direction: direction,
        }))
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [projectId, nodes, edges, direction])

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds))
  }, [])

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => applyEdgeChanges(changes, eds))
  }, [])

  const onConnect = useCallback((connection: Connection) => {
    pushUndo()
    setEdges(eds => addEdge({ ...connection, type: 'deletable' }, eds))
    trackEvent('connection_created', { project_id: projectId })
  }, [pushUndo, projectId])

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id })
  }, [])

  const deleteNode = useCallback((nodeId: string) => {
    if (nodeId === 'root') return
    pushUndo()
    // Remove node and all connected edges
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    setNodes(nds => nds.filter(n => n.id !== nodeId))
    setContextMenu(null)
    trackEvent('tech_removed_from_canvas', { project_id: projectId })
  }, [pushUndo, projectId])

  const existingTechIds = new Set(
    nodes.filter(n => n.type === 'tech').map(n => (n.data as any).techId as number).filter(Boolean)
  )

  const addTechnologies = useCallback((techs: { id: number; name: string; category: string; svg_logo: string; color: string }[]) => {
    pushUndo()
    const newNodes: Node[] = techs.map((t, i) => ({
      id: `tech-${t.id}`,
      type: 'tech',
      position: { x: 0, y: 0 },
      data: {
        label: t.name,
        icon: '',
        category: t.category,
        color: t.color,
        svgLogo: t.svg_logo,
        techId: t.id,
        direction,
      },
    }))

    const newEdges: Edge[] = techs.map(t => ({
      id: `e-root-tech-${t.id}`,
      source: 'root',
      target: `tech-${t.id}`,
      type: 'deletable',
    }))

    setNodes(prev => {
      const all = [...prev, ...newNodes]
      const allEdges = [...edges, ...newEdges]
      setEdges(allEdges)
      return autoArrange(all, allEdges, direction)
    })

    setTimeout(() => fitView({ padding: 0.2 }), 200)
    techs.forEach(t => trackEvent('tech_added_to_canvas', { project_id: projectId, tech_name: t.name, category: t.category }))
  }, [pushUndo, edges, direction, fitView, projectId])

  const toggleDirection = useCallback(() => {
    const newDir = direction === 'TB' ? 'LR' : 'TB'
    setDirection(newDir)
    const arranged = autoArrange(
      nodes.map(n => ({ ...n, data: { ...n.data, direction: newDir } })),
      edges,
      newDir,
    )
    setNodes(arranged)
    setTimeout(() => fitView({ padding: 0.2 }), 100)
  }, [direction, nodes, edges, fitView])

  const reLayout = useCallback(() => {
    const arranged = autoArrange(nodes, edges, direction)
    setNodes(arranged)
    setTimeout(() => fitView({ padding: 0.2 }), 100)
  }, [nodes, edges, direction, fitView])

  return (
    <div className="canvas-wrapper">
      <div className="canvas-toolbar">
        <button className="primary" onClick={() => setPickerOpen(true)}>+ Add Technology</button>
        <button onClick={toggleDirection}>{direction === 'TB' ? '↔ Horizontal' : '↕ Vertical'}</button>
        <button onClick={reLayout}>Re-layout</button>
        <button onClick={() => fitView({ padding: 0.2 })}>Fit view</button>
        <button onClick={() => { trackEvent('pdf_exported', { project_id: projectId }); window.open(`/api/projects/${projectId}/export-pdf`, '_blank') }}>Export PDF</button>
        <span className={`canvas-save-status ${saveStatus}`}>
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Save failed' : ''}
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onClick={() => setContextMenu(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'deletable' }}
        snapToGrid
        snapGrid={[20, 20]}
        minZoom={0.3}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background gap={20} size={1} color="#e8e8e4" />
        <Controls />
        <MiniMap
          nodeColor={n => n.type === 'root' ? '#2563eb' : (n.data as any)?.color || '#ddd'}
          style={{ background: '#fafaf8', border: '1px solid #e8e8e4', borderRadius: 8 }}
        />
      </ReactFlow>

      {/* Context menu */}
      {contextMenu && (
        <div className="tree-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {contextMenu.nodeId !== 'root' && (
            <button className="danger" onClick={() => deleteNode(contextMenu.nodeId)}>
              Remove from canvas
            </button>
          )}
          <button onClick={() => { setPickerOpen(true); setContextMenu(null) }}>
            Add technology...
          </button>
        </div>
      )}

      {/* Tech picker */}
      {pickerOpen && (
        <TechPicker
          onPick={addTechnologies}
          onClose={() => setPickerOpen(false)}
          existingIds={existingTechIds}
        />
      )}
    </div>
  )
}

export function ProjectCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  )
}
