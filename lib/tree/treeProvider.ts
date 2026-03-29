import type { ComponentType } from 'react'
import type { Node, Edge, NodeProps } from '@xyflow/react'

export interface TreeNodeData {
  label: string
  icon: string
  isRoot?: boolean
  direction?: 'TB' | 'LR'
  [key: string]: unknown
}

export interface TreeContextMenuItem {
  label: string
  action: () => void
  disabled?: boolean
  danger?: boolean
  dividerBefore?: boolean
}

export interface TreeToolbarAction {
  label: string
  onClick: () => void
}

export interface NodeToolbarAction {
  icon: string
  tooltip: string
  onClick: () => void
  danger?: boolean
}

export interface ContentPickerItem {
  id: string
  label: string
  icon: string
  category?: string
  color?: string
  svgLogo?: string
  data?: Record<string, unknown>
}

export interface ContentPickerStaticTab {
  type: 'static-list'
  label: string
  items: ContentPickerItem[]
}

export interface ContentPickerSearchTab {
  type: 'search'
  label: string
  searchFn: (query: string) => Promise<ContentPickerItem[]>
}

export type ContentPickerTab = ContentPickerStaticTab | ContentPickerSearchTab

export interface ContentPickerConfig {
  title: string
  tabs: ContentPickerTab[]
  multiSelect?: boolean
}

export interface TreeProvider {
  type: string
  title: string
  nodeTypes: Record<string, ComponentType<NodeProps>>
  rootNode: Node
  rootColor?: string
  getContextMenuItems: (node: Node, helpers: TreeActionHelpers) => TreeContextMenuItem[]
  getToolbarActions?: (helpers: TreeActionHelpers) => TreeToolbarAction[]
  renderToolbarExtra?: (helpers: TreeActionHelpers) => React.ReactNode
  validateDrop?: (sourceNode: Node, targetNode: Node) => boolean
  onNodeDoubleClick?: (node: Node) => void
  getNodeToolbarActions?: (node: Node, helpers: TreeActionHelpers) => NodeToolbarAction[]
  contentPickerConfig?: ContentPickerConfig
  onContentPicked?: (items: ContentPickerItem[], targetNodeId: string, helpers: TreeActionHelpers) => void
}

export interface TreeActionHelpers {
  nodes: Node[]
  edges: Edge[]
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  addNode: (node: Node, parentId: string) => void
  deleteNode: (nodeId: string) => void
  disconnectNode: (nodeId: string) => void
  moveSibling: (nodeId: string, delta: -1 | 1) => void
  getSiblings: (nodeId: string) => string[]
  getChildren: (nodeId: string) => string[]
  direction: 'TB' | 'LR'
  fitView: () => void
  confirmDelete: (nodeId: string, label: string, childCount: number) => void
  selectedNodeId: string | null
  rootId: string
}
