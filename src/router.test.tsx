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
  ])('%s muestra su página', (path, title) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy()
  })

  it('marca el punto activo en la navegación global', () => {
    renderAt('/punto-2')
    expect(screen.getByRole('link', { name: /Punto 2/ }).getAttribute('aria-current')).toBe('page')
  })

  it('muestra 404 en rutas desconocidas', () => {
    renderAt('/no-existe')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeTruthy()
  })
})
