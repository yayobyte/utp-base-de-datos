import type { Node, NodeProps } from '@xyflow/react'
import type { TallerSchemaTable } from '@/data'

export type TableNodeType = Node<TallerSchemaTable & Record<string, unknown>, 'table'>

export type TableNodeProps = NodeProps<TableNodeType>
