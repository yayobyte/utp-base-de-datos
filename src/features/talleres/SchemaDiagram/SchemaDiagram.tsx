import { Background, Controls, MarkerType, MiniMap, ReactFlow, useEdgesState, useNodesState, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect, useRef } from 'react'
import { layoutSchema, nodeSize } from '@/domain/talleres/diagramLayout'
import { TableNode } from '../TableNode/TableNode'
import type { TableNodeType } from '../TableNode/TableNode.types'
import styles from './SchemaDiagram.module.css'
import type { SchemaDiagramProps } from './SchemaDiagram.types'

const NODE_TYPES = { table: TableNode }

/** Diagrama entidad-relación del taller: zoom con la rueda, arrastrar para moverse, tablas arrastrables. */
export function SchemaDiagram({ schema, loading = false, layoutKey = 0 }: SchemaDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeType>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  // Firma del layout: solo se reubica todo si cambian las tablas, sus columnas o las relaciones.
  const signature = useRef('')

  useEffect(() => {
    if (!schema) return
    const sig = `${layoutKey}|${schema.tables.map((t) => `${t.name}:${t.columns.map((c) => c.name).join(',')}`).join(';')}|${schema.relations
      .map((r) => `${r.from}>${r.to}`)
      .join(';')}`
    const layout = layoutSchema(schema.tables, schema.relations)
    const sized = (data: TableNodeType['data']) => ({ width: nodeSize(data).width })

    if (sig !== signature.current) {
      signature.current = sig
      setNodes(layout.nodes.map((n) => ({ ...n, data: n.data as TableNodeType['data'], style: sized(n.data as TableNodeType['data']) })))
    } else {
      // Mismas tablas: se conservan las posiciones (incluidas las arrastradas) y solo se refrescan los datos.
      const byName = new Map(schema.tables.map((t) => [t.name, t]))
      setNodes((prev) =>
        prev.map((n) => {
          const data = (byName.get(n.id) ?? n.data) as TableNodeType['data']
          return { ...n, data, style: sized(data) }
        }),
      )
    }
    setEdges(
      layout.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        className: e.inferred ? styles.inferred : styles.edge,
      })),
    )
  }, [schema, layoutKey, setNodes, setEdges])

  return (
    <div className={styles.canvas}>
      {!schema && <p className={styles.loading}>{loading ? 'Dibujando el diagrama…' : 'Sin datos'}</p>}
      <ReactFlow
        key={layoutKey}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={2}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className={styles.minimap} />
      </ReactFlow>
    </div>
  )
}
