import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getTallerDb } from '@/data'
import { TALLERES } from '@/domain/talleres/catalog'
import { tallerService } from '@/services/talleres/tallerService'
import { TallerPage } from './TallerPage'

const joins = TALLERES.find((t) => t.id === 'joins')!
const dreamhome = TALLERES.find((t) => t.id === 'dreamhome')!

const renderTaller = (id: 'joins' | 'dreamhome') =>
  render(
    <MemoryRouter>
      <TallerPage tallerId={id} />
    </MemoryRouter>,
  )

const tableCount = (name: string) => {
  const summary = screen.getByText(name, { selector: 'span' }).closest('summary')!
  return within(summary).getAllByText(/^\d+$/).at(-1)!.textContent
}

// React Flow mide el DOM: jsdom no trae ResizeObserver ni DOMMatrix.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver
globalThis.DOMMatrixReadOnly ??= class {
  m22 = 1
  constructor() {}
} as unknown as typeof DOMMatrixReadOnly

const diagramNode = (name: string) => document.querySelector(`[data-table="${name}"]`) as HTMLElement | null

// Sin IndexedDB (jsdom) cada taller vive en memoria; se restaura antes de cada prueba.
beforeAll(async () => {
  await Promise.all([getTallerDb(joins.id, joins.setupSql), getTallerDb(dreamhome.id, dreamhome.setupSql)])
}, 30_000)

beforeEach(async () => {
  await tallerService.reset(joins)
})

describe('Talleres (PostgreSQL en el navegador)', () => {
  it('carga las 15 tablas del taller JOINs', async () => {
    renderTaller('joins')
    await waitFor(() => expect(tableCount('student')).toBe('24'))
    expect(tableCount('emp')).toBe('59')
    expect(tableCount('certified')).toBe('69')
  })

  it('carga DreamHome con sus 8 tablas', async () => {
    const tables = await tallerService.loadTables(dreamhome)
    expect(tables.map((t) => [t.name, t.total])).toEqual([
      ['branch', 5],
      ['client', 4],
      ['lease', 3],
      ['privateowner', 4],
      ['propertyforrent', 6],
      ['registration', 4],
      ['staff', 6],
      ['viewing', 5],
    ])
  })

  it('la consola admite DDL; restaurar lo deshace', async () => {
    renderTaller('joins')
    await waitFor(() => expect(tableCount('student')).toBe('24'))
    const consola = document.getElementById('consola')!
    fireEvent.change(within(consola).getByRole('textbox'), {
      target: { value: 'create table notas(n int);\ninsert into notas values (5), (4);\nselect * from notas;' },
    })
    fireEvent.click(within(consola).getByRole('button', { name: 'Ejecutar' }))
    expect(await within(consola).findByText('2 filas')).toBeTruthy()
    await waitFor(() => expect(tableCount('notas')).toBe('2'))

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: '¿Restaurar la base de datos?' })).getByRole('button', { name: 'Restaurar' }))
    expect(await screen.findByText('Base de datos restaurada con el script original del taller.')).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('notas', { selector: 'span' })).toBeNull())
  })

  it('todos los ejercicios del taller JOINs corren en orden con los resultados esperados', async () => {
    const results = []
    for (const e of joins.exercises) results.push([e.title.split('.')[0], await tallerService.run(joins, e.sql)] as const)
    const byId = Object.fromEntries(results)
    expect(byId.a.rowCount).toBe(17)
    expect(byId.b.rowCount).toBe(69)
    expect(byId.f.rowCount).toBe(16)
    expect(byId.g.rowCount).toBe(0) // v_partes_rojas vacía tras el borrado
    expect(byId.m.rows).toEqual([{ aid: '1', aname: 'Boeing 747-400', millas: '9795' }])
    expect(byId.n.rows).toEqual([{ origin: 'Los Angeles', destination: 'Honolulu', pasajeros: '660' }])
  })

  it('el esquema trae las 10 FK declaradas del taller JOINs y 10 filas de muestra', async () => {
    const schema = await tallerService.loadSchema(joins)
    expect(schema.tables).toHaveLength(15)
    expect(schema.relations.filter((r) => !r.inferred).map((r) => `${r.from}>${r.to}`).sort()).toEqual([
      'catalog>parts',
      'catalog>suppliers',
      'certified>aircraft',
      'certified>employees',
      'class>faculty',
      'dept>emp',
      'enrolled>class',
      'enrolled>student',
      'works>dept',
      'works>emp',
    ])
    expect(schema.relations.some((r) => r.inferred)).toBe(false)
    const student = schema.tables.find((t) => t.name === 'student')!
    expect([student.rows.length, student.total]).toEqual([10, 24])
    expect(student.columns[0]).toMatchObject({ name: 'snum', pk: true, type: 'numeric(9,0)' })
    const enrolled = schema.tables.find((t) => t.name === 'enrolled')!
    expect(enrolled.columns.map((c) => [c.name, c.pk, c.fk])).toEqual([
      ['snum', true, 'student'],
      ['cname', true, 'class'],
    ])
  })

  it('DreamHome no declara FK: las relaciones se deducen por el nombre de columna', async () => {
    const schema = await tallerService.loadSchema(dreamhome)
    const rels = schema.relations.map((r) => `${r.from}.${r.fromColumns[0]}>${r.to}`)
    expect(schema.relations.every((r) => r.inferred)).toBe(true)
    expect(rels).toEqual(
      expect.arrayContaining([
        'staff.branchno>branch',
        'propertyforrent.ownerno>privateowner',
        'propertyforrent.staffno>staff',
        'viewing.clientno>client',
        'viewing.propertyno>propertyforrent',
        'lease.propertyno>propertyforrent',
        'registration.staffno>staff',
      ]),
    )
  })

  it('el diagrama muestra las tablas con su muestra y agrega las tablas nuevas', async () => {
    renderTaller('joins')
    await waitFor(() => expect(diagramNode('student')).toBeTruthy(), { timeout: 10_000 })
    expect(within(diagramNode('student')!).getByText('10 de 24 filas')).toBeTruthy()
    expect(within(diagramNode('sailors')!).getByText('4 filas')).toBeTruthy()

    const consola = document.getElementById('consola')!
    fireEvent.change(within(consola).getByRole('textbox'), { target: { value: 'create table nueva(id int primary key);' } })
    fireEvent.click(within(consola).getByRole('button', { name: 'Ejecutar' }))
    await waitFor(() => expect(diagramNode('nueva')).toBeTruthy(), { timeout: 10_000 })
  })

  it('un error deja la BD usable y se muestra', async () => {
    await expect(tallerService.run(joins, 'begin;\nselect * from no_existe;\ncommit;')).rejects.toThrow(/no_existe/)
    const r = await tallerService.run(joins, 'select count(*)::int as n from student;')
    expect(r.rows).toEqual([{ n: 24 }])
  })
})
