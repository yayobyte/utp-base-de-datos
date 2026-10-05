import { normalize, PRESTAMO_ORIGINAL, repeated, splitAutores, splitLector, to1FN, to2FN, to3FN, toUNF, type NfStep } from './normalizacion'

const table = (step: NfStep, name: string) => step.tables.find((t) => t.name === name)!
const counts = (step: NfStep) => Object.fromEntries(step.tables.map((t) => [t.name, t.rows.length]))

describe('utilidades', () => {
  it('separa autores múltiples', () => {
    expect(splitAutores('Nancy Greenberg y Priya Nathan')).toEqual(['Nancy Greenberg', 'Priya Nathan'])
    expect(splitAutores('A, B & C')).toEqual(['A', 'B', 'C'])
    expect(splitAutores('Murray Spiegel')).toEqual(['Murray Spiegel'])
  })

  it('separa apellidos y nombre del lector', () => {
    expect(splitLector('Pérez Gómez, Juan')).toEqual({ apellidos: 'Pérez Gómez', nombre: 'Juan' })
    expect(splitLector('Roca')).toEqual({ apellidos: 'Roca', nombre: '' })
  })

  it('detecta valores repetidos', () => {
    expect(repeated(PRESTAMO_ORIGINAL, 'editorial')).toEqual([{ value: 'McGraw Hill', count: 3 }])
  })
})

describe('pasos de normalización con los datos del examen', () => {
  it('0FN: 5 filas y problemas señalados', () => {
    const step = toUNF(PRESTAMO_ORIGINAL)
    expect(counts(step)).toEqual({ Prestamo: 5 })
    expect(step.cambios.join(' ')).toContain('1006')
    expect(step.cambios.join(' ')).toContain('McGraw Hill')
  })

  it('1FN: 6 filas (1006 se duplica), lector separado, PK compuesta', () => {
    const step = to1FN(PRESTAMO_ORIGINAL)
    const t = table(step, 'Prestamo')
    expect(t.rows).toHaveLength(6)
    expect(t.rows.filter((r) => r.CodLibro === '1006').map((r) => r.Autor)).toEqual(['Nancy Greenberg', 'Priya Nathan'])
    expect(t.rows[0]).toMatchObject({ ApellidosLector: 'Pérez Gómez', NombreLector: 'Juan' })
    expect(t.columns.filter((c) => c.key === 'PK').map((c) => c.name)).toEqual(['CodLibro', 'Autor'])
  })

  it('2FN: Libro 5, LibroAutor 6, Prestamo 5', () => {
    expect(counts(to2FN(PRESTAMO_ORIGINAL))).toEqual({ Libro: 5, LibroAutor: 6, Prestamo: 5 })
  })

  it('3FN: catálogos sin repetidos y FKs con ids', () => {
    const step = to3FN(PRESTAMO_ORIGINAL)
    expect(counts(step)).toEqual({ Editorial: 3, Autor: 5, Lector: 4, Libro: 5, LibroAutor: 6, Prestamo: 5 })
    expect(table(step, 'Editorial').rows).toEqual([
      { IdEditorial: 'E1', Nombre: 'McGraw Hill' },
      { IdEditorial: 'E2', Nombre: 'Anaya' },
      { IdEditorial: 'E3', Nombre: 'Oracle Corp.' },
    ])
    // Juan Pérez Gómez tiene dos préstamos y un solo registro de lector
    const prestamos = table(step, 'Prestamo').rows
    expect(prestamos.find((p) => p.CodLibro === '1001')!.IdLector).toBe(prestamos.find((p) => p.CodLibro === '1007')!.IdLector)
    // toda FK apunta a un id existente
    for (const t of step.tables) {
      for (const col of t.columns.filter((c) => c.references)) {
        const target = table(step, col.references!)
        const pk = target.columns.find((c) => c.key?.includes('PK'))!.name
        const ids = new Set(target.rows.map((r) => r[pk]))
        for (const row of t.rows) expect(ids.has(row[col.name])).toBe(true)
      }
    }
  })

  it('normalize devuelve los 4 pasos en orden', () => {
    expect(normalize(PRESTAMO_ORIGINAL).map((s) => s.label)).toEqual(['0FN', '1FN', '2FN', '3FN'])
  })
})

describe('sandbox: los pasos se recalculan al editar los datos', () => {
  it('cambiar la editorial de un libro cambia el catálogo de 3FN', () => {
    const rows = PRESTAMO_ORIGINAL.map((r) => (r.codLibro === '1004' ? { ...r, editorial: 'McGraw Hill' } : r))
    expect(table(to3FN(rows), 'Editorial').rows.map((r) => r.Nombre)).toEqual(['McGraw Hill', 'Oracle Corp.'])
  })

  it('un tercer autor añade filas en 1FN y LibroAutor', () => {
    const rows = PRESTAMO_ORIGINAL.map((r) => (r.codLibro === '1006' ? { ...r, autor: 'Nancy Greenberg, Priya Nathan y Ana Ruiz' } : r))
    expect(table(to1FN(rows), 'Prestamo').rows).toHaveLength(7)
    expect(table(to2FN(rows), 'LibroAutor').rows).toHaveLength(7)
  })
})
