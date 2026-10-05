import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './router'

const renderAt = (path: string) => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />)

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
    expect(await screen.findByRole('heading', { level: 1, name: 'Estado del despliegue' })).toBeTruthy()
    expect(await screen.findAllByText('Sin configurar')).toHaveLength(1)
  })

  it('muestra 404 en rutas desconocidas', () => {
    renderAt('/no-existe')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeTruthy()
  })
})
