import { fireEvent, render, screen, within } from '@testing-library/react'
import { useNormalizacionStore } from '@/state/normalizacionStore'
import { Punto3Page } from './Punto3Page'

const resultTables = () => screen.getByRole('region', { name: /Resultado/ })
const rowsBadge = (name: string) => within(within(resultTables()).getByRole('heading', { name }).closest('article')!).getByText(/filas$/).textContent

beforeEach(() => {
  useNormalizacionStore.setState({ step: 0 })
  useNormalizacionStore.getState().resetRows()
})

describe('Punto3Page', () => {
  it('empieza en 0FN con la tabla original de 5 filas', () => {
    render(<Punto3Page />)
    expect(screen.getByRole('heading', { name: /0FN · Tabla original/ })).toBeTruthy()
    expect(rowsBadge('Prestamo')).toBe('5 filas')
    expect(screen.getByRole('button', { name: '← Anterior' })).toHaveProperty('disabled', true)
  })

  it('avanza paso a paso hasta 3FN con antes/después y esquema final', () => {
    render(<Punto3Page />)
    const next = screen.getByRole('button', { name: 'Siguiente →' })

    fireEvent.click(next)
    expect(screen.getByRole('heading', { name: /1FN · Primera forma normal/ })).toBeTruthy()
    expect(rowsBadge('Prestamo')).toBe('6 filas')
    expect(screen.getByRole('region', { name: 'Antes (0FN)' })).toBeTruthy()

    fireEvent.click(next)
    expect(rowsBadge('LibroAutor')).toBe('6 filas')

    fireEvent.click(next)
    expect(screen.getByRole('heading', { name: /3FN · Tercera forma normal/ })).toBeTruthy()
    expect(rowsBadge('Editorial')).toBe('3 filas')
    expect(screen.getByLabelText('Esquema relacional final')).toBeTruthy()
    expect((next as HTMLButtonElement).disabled).toBe(true)
  })

  it('el stepper permite saltar directamente a un paso', () => {
    render(<Punto3Page />)
    fireEvent.click(screen.getByRole('button', { name: /2FN/ }))
    expect(screen.getByRole('heading', { name: /2FN · Segunda forma normal/ })).toBeTruthy()
  })

  it('sandbox: editar la editorial recalcula 3FN y se puede volver a los datos del examen', () => {
    render(<Punto3Page initialStep={3} />)
    fireEvent.change(screen.getByLabelText('Editorial fila 2'), { target: { value: 'McGraw Hill' } })
    expect(rowsBadge('Editorial')).toBe('2 filas')
    expect(screen.getByText('Datos modificados')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Volver a los datos del examen' }))
    expect(rowsBadge('Editorial')).toBe('3 filas')
  })
})
