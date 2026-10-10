import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './router'

const renderAt = (path: string) => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />)

// Las rutas diferidas (lazy) se precargan: así las pruebas no dependen de la carga de la máquina.
beforeAll(async () => {
  await Promise.all([
    import('@/features/punto1/Punto1Layout/Punto1Layout'),
    import('@/features/punto2/Punto2Page/Punto2Page'),
    import('@/features/punto3/Punto3Page/Punto3Page'),
    import('@/features/estado/StatusPage/StatusPage'),
    import('@/features/talleres/TalleresPage/TalleresPage'),
  ])
}, 30_000)

describe('router', () => {
  it('muestra el inicio con los tres puntos', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Examen final, resuelto y ejecutable' })).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it.each([
    ['/punto-1', 'Registro de notas UTP'],
    ['/punto-1/estudiante/prematricula', 'Registro de notas UTP'],
    ['/punto-2', 'Películas, actores y alquileres'],
    ['/punto-3', 'Tabla Préstamo'],
  ])('%s muestra su página', async (path, title) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { level: 1, name: title }, { timeout: 5000 })).toBeTruthy()
  })

  it('marca el punto activo en la navegación global', async () => {
    renderAt('/punto-2')
    await screen.findByRole('heading', { level: 1, name: 'Películas, actores y alquileres' })
    expect(screen.getByRole('link', { name: /Punto 2/ }).getAttribute('aria-current')).toBe('page')
  })

  it('muestra el estado del despliegue', async () => {
    renderAt('/estado')
    expect(await screen.findByRole('heading', { level: 1, name: 'Estado del despliegue' }, { timeout: 5000 })).toBeTruthy()
    expect(await screen.findAllByText('Sin configurar')).toHaveLength(1)
  })

  it('/talleres lista los talleres sin tocar los puntos del examen', async () => {
    renderAt('/talleres')
    expect(await screen.findByRole('heading', { level: 1, name: 'Talleres' }, { timeout: 5000 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Taller JOINs — dbbook' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Taller DreamHome' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Talleres' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getAllByRole('link', { name: /Punto \d/ })).toHaveLength(3)
  })

  it('muestra 404 en rutas desconocidas', () => {
    renderAt('/no-existe')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeTruthy()
  })
})
