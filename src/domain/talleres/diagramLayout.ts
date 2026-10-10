import dagre from '@dagrejs/dagre'

/** Lo mínimo que el layout necesita de cada tabla (el resto viaja intacto en `data`). */
export interface LayoutTable {
  name: string
  columns: { name: string }[]
  rows: Record<string, unknown>[]
}

export interface LayoutRelation {
  from: string
  fromColumns: string[]
  to: string
  toColumns: string[]
  inferred: boolean
}

export interface DiagramNode<T> {
  id: string
  type: 'table'
  position: { x: number; y: number }
  data: T
}

export interface DiagramEdge {
  id: string
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
  inferred: boolean
  label?: string
}

/** Medidas aproximadas (px de pantalla con zoom 1) de un nodo; deben coincidir con TableNode. */
export const NODE_METRICS = {
  minWidth: 260,
  charWidth: 7.5,
  maxWidth: 720,
  header: 40,
  columnRow: 26,
  dataHeader: 26,
  dataRow: 25,
  footer: 30,
} as const

/** Id del handle de una columna (lado izquierdo = destino, derecho = origen). */
export const handleId = (column: string, side: 'in' | 'out') => `${side}:${column}`

export function nodeSize(table: LayoutTable): { width: number; height: number } {
  const m = NODE_METRICS
  // Ancho de la mini tabla: cada columna ocupa lo que su nombre o su valor más largo.
  const dataWidth = table.columns.reduce((sum, c) => {
    const longest = Math.max(c.name.length, ...table.rows.map((r) => String(r[c.name] ?? 'NULL').length))
    return sum + Math.min(longest, 24) * m.charWidth + 16
  }, 0)
  const width = Math.round(Math.min(Math.max(m.minWidth, dataWidth), m.maxWidth))
  const height = m.header + table.columns.length * m.columnRow + m.dataHeader + Math.max(table.rows.length, 1) * m.dataRow + m.footer
  return { width, height }
}

/** Ancho máximo de una fila de grupos antes de pasar a la siguiente (px con zoom 1). */
const ROW_WIDTH = 2600
const GROUP_GAP = 96

/** Grupos de tablas conectadas entre sí (las sueltas forman su propio grupo). */
function components(names: string[], relations: LayoutRelation[]): string[][] {
  const parent = new Map(names.map((n) => [n, n]))
  const find = (n: string): string => (parent.get(n) === n ? n : find(parent.get(n)!))
  for (const r of relations) parent.set(find(r.from), find(r.to))
  const groups = new Map<string, string[]>()
  for (const n of names) groups.set(find(n), [...(groups.get(find(n)) ?? []), n])
  // Los grupos grandes primero; las tablas sueltas al final.
  return [...groups.values()].sort((a, b) => b.length - a.length)
}

/**
 * Nodos y aristas para React Flow. Cada grupo de tablas relacionadas se ubica de izquierda a
 * derecha siguiendo las llaves foráneas (dagre); los grupos se acomodan en filas, como un mosaico.
 */
export function layoutSchema<T extends LayoutTable>(
  tables: T[],
  relations: LayoutRelation[],
): { nodes: DiagramNode<T>[]; edges: DiagramEdge[] } {
  const names = new Set(tables.map((t) => t.name))
  const valid = relations.filter((r) => names.has(r.from) && names.has(r.to) && r.from !== r.to)
  const byName = new Map(tables.map((t) => [t.name, t]))
  const positions = new Map<string, { x: number; y: number }>()

  let cursorX = 0
  let cursorY = 0
  let rowHeight = 0
  for (const group of components([...names], valid)) {
    const g = new dagre.graphlib.Graph()
    g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 110 })
    g.setDefaultEdgeLabel(() => ({}))
    for (const n of group) g.setNode(n, nodeSize(byName.get(n)!))
    // La tabla referenciada va a la izquierda: arista destino → origen.
    for (const r of valid) if (group.includes(r.from)) g.setEdge(r.to, r.from)
    dagre.layout(g)
    const { width = 0, height = 0 } = g.graph()

    if (cursorX > 0 && cursorX + width > ROW_WIDTH) {
      cursorX = 0
      cursorY += rowHeight + GROUP_GAP
      rowHeight = 0
    }
    for (const n of group) {
      const node = g.node(n)
      positions.set(n, { x: cursorX + node.x - node.width / 2, y: cursorY + node.y - node.height / 2 })
    }
    cursorX += width + GROUP_GAP
    rowHeight = Math.max(rowHeight, height)
  }

  const nodes = tables.map((t) => ({ id: t.name, type: 'table' as const, position: positions.get(t.name)!, data: t }))

  const edges = valid.map((r) => ({
    id: `fk-${r.from}-${r.fromColumns.join('-')}`,
    // React Flow: la línea sale de la tabla referenciada (PK) y llega a la columna FK.
    source: r.to,
    target: r.from,
    sourceHandle: handleId(r.toColumns[0] ?? r.fromColumns[0], 'out'),
    targetHandle: handleId(r.fromColumns[0], 'in'),
    inferred: r.inferred,
    ...(r.inferred ? { label: r.fromColumns.join(', ') } : {}),
  }))

  return { nodes, edges }
}
