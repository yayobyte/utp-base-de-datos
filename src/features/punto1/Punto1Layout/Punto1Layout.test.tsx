import type { PGlite } from '@electric-sql/pglite'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { setClientForTesting } from '@/data/clients'
import { useImpersonationStore } from '@/state/impersonationStore'
import { migratedDb } from '@/test/pglite'
import { pgliteSupabase } from '@/test/pgliteSupabase'
import { Punto1Layout } from './Punto1Layout'

let db: PGlite

beforeAll(async () => {
  db = await migratedDb('punto-1')
  await db.exec('set role anon')
}, 30_000)

afterAll(() => db.close())

beforeEach(async () => {
  vi.stubEnv('VITE_P1_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('VITE_P1_SUPABASE_ANON_KEY', 'sb_publishable_test')
  setClientForTesting('p1', pgliteSupabase(db))
  await db.query('select public.reiniciar_demo()')
  useImpersonationStore.setState({ personaId: null })
})

afterEach(() => {
  setClientForTesting('p1', null)
  vi.unstubAllEnvs()
})

const renderAt = (path = '/punto-1') =>
  render(<RouterProvider router={createMemoryRouter([{ path: '/punto-1/*', element: <Punto1Layout /> }], { initialEntries: [path] })} />)

const actuarComo = async (nombre: string) => fireEvent.click(await screen.findByRole('button', { name: nombre }))
const nav = () => screen.getByRole('navigation', { name: /Acciones de/ })

describe('Punto1Layout (contra PGlite con la migración real)', () => {
  it('pide elegir persona y muestra las fases del calendario', async () => {
    renderAt()
    expect(await screen.findByText('Elige a quién suplantar')).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Actuar como' })).toBeTruthy()
    expect(screen.getByText('Planeación').closest('li')!.getAttribute('aria-current')).toBe('step')
  })

  it('Admin aprueba y avanza; el estudiante ve solo lo permitido y prematricula', async () => {
    renderAt()
    await actuarComo('Laura Ortiz')
    expect(await screen.findByRole('heading', { name: 'Panel del periodo' })).toBeTruthy()

    fireEvent.click(within(nav()).getByRole('button', { name: /Calendario/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Aprobar calendario' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Avanzar a Prematrícula' }))
    await waitFor(() => expect(screen.getByText('Prematrícula', { selector: 'li' }).getAttribute('aria-current')).toBe('step'))

    // Juan: IS301 bloqueada por IS202 (2.5)
    await actuarComo('Juan Pérez')
    fireEvent.click(await within(nav()).findByRole('button', { name: /Prematrícula/ }))
    expect(await screen.findByText(/Prerrequisito sin aprobar: IS202 \(nota 2\.5\)/)).toBeTruthy()
    const is202 = screen.getByText('IS202 · Estructuras de Datos').closest('label')!.querySelector('input')!
    fireEvent.click(is202)
    fireEvent.click(screen.getByRole('button', { name: /Guardar prematrícula \(4 créditos\)/ }))
    expect(await screen.findByText('Prematrícula guardada')).toBeTruthy()

    // Acciones fuera de fase aparecen deshabilitadas con el motivo
    expect((within(nav()).getByRole('button', { name: /Cancelar asignaturas/ }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('el resumen del estudiante muestra atributos derivados y estado', async () => {
    useImpersonationStore.setState({ personaId: 'E003' })
    renderAt('/punto-1/est-resumen')
    expect(await screen.findByText('2.88')).toBeTruthy()
    expect(screen.getByText('1 periodo(s) en prueba')).toBeTruthy()
  })
})
