import { layoutSchema, nodeSize } from './diagramLayout'

const t = (name: string, columns: string[], rows = 0) => ({
  name,
  columns: columns.map((c) => ({ name: c })),
  rows: Array.from({ length: rows }, (_, i) => Object.fromEntries(columns.map((c) => [c, i]))),
})

describe('layoutSchema', () => {
  const tables = [t('student', ['snum', 'sname'], 3), t('enrolled', ['snum', 'cname'], 2), t('sailors', ['sid'])]
  const relations = [{ from: 'enrolled', fromColumns: ['snum'], to: 'student', toColumns: ['snum'], inferred: false }]

  it('un nodo por tabla (incluidas las sueltas) y una arista por relación', () => {
    const { nodes, edges } = layoutSchema(tables, relations)
    expect(nodes.map((n) => n.id)).toEqual(['student', 'enrolled', 'sailors'])
    expect(edges).toEqual([
      { id: 'fk-enrolled-snum', source: 'student', target: 'enrolled', sourceHandle: 'out:snum', targetHandle: 'in:snum', inferred: false },
    ])
  })

  it('la tabla referenciada queda a la izquierda', () => {
    const { nodes } = layoutSchema(tables, relations)
    const x = (id: string) => nodes.find((n) => n.id === id)!.position.x
    expect(x('student')).toBeLessThan(x('enrolled'))
  })

  it('las relaciones deducidas llevan etiqueta e ignoran tablas inexistentes', () => {
    const { edges } = layoutSchema(tables, [
      { from: 'enrolled', fromColumns: ['cname'], to: 'class', toColumns: ['name'], inferred: false },
      { from: 'enrolled', fromColumns: ['snum'], to: 'student', toColumns: ['snum'], inferred: true },
    ])
    expect(edges).toHaveLength(1)
    expect(edges[0].label).toBe('snum')
  })

  it('el alto crece con columnas y filas', () => {
    expect(nodeSize(t('a', ['x', 'y'], 10)).height).toBeGreaterThan(nodeSize(t('a', ['x'], 1)).height)
  })
})
