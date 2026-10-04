import { fireEvent, render, screen } from '@testing-library/react'
import { UiShowcase } from './UiShowcase'

describe('UiShowcase', () => {
  it('renderiza todos los elementos del kit y abre el modal', () => {
    render(<UiShowcase />)
    expect(screen.getByRole('heading', { name: 'Kit de interfaz' })).toBeTruthy()
    expect(screen.getByRole('tablist', { name: 'Ejemplo' })).toBeTruthy()
    expect(screen.getAllByRole('table').length).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir modal' }))
    expect(screen.getByRole('dialog', { name: '¿Ejecutar DELETE?' })).toBeTruthy()
  })
})
