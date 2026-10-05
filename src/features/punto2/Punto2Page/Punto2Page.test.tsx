import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { resetData } from '@/data'
import { getLocalDb } from '@/data/punto2/localDb'
import { Punto2Page } from './Punto2Page'

// La página usa el PostgreSQL local (PGlite) con las migraciones reales de databases/punto-2.
beforeAll(async () => {
  await getLocalDb()
}, 30_000)

beforeEach(async () => {
  await resetData()
})

const tableCount = (name: string) => {
  const summary = screen.getByText(name, { selector: 'span' }).closest('summary')!
  return within(summary).getByText(/^\d+$|…/).textContent
}

describe('Punto2Page (PostgreSQL en el navegador)', () => {
  it('muestra las 11 tablas con sus filas', async () => {
    render(<Punto2Page />)
    await waitFor(() => expect(tableCount('member')).toBe('4'))
    expect(tableCount('dvdactor')).toBe('7')
    expect(tableCount('staff')).toBe('6')
  })

  it('ejecuta el punto c y muestra 51.96', async () => {
    render(<Punto2Page />)
    const card = document.getElementById('punto-c')!
    fireEvent.click(within(card).getByRole('button', { name: 'Ejecutar' }))
    expect(await within(card).findByText('51.96')).toBeTruthy()
    expect(within(card).getByText('1 fila')).toBeTruthy()
  })

  it('el punto d pide confirmación, borra a Serena y las tablas se actualizan; restablecer lo deshace', async () => {
    render(<Punto2Page />)
    await waitFor(() => expect(tableCount('member')).toBe('4'))

    const card = document.getElementById('punto-d')!
    fireEvent.click(within(card).getByRole('button', { name: 'Ejecutar' }))
    const dialog = screen.getByRole('dialog', { name: '¿Ejecutar el punto d?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ejecutar' }))

    expect(await within(card).findByText('3 filas')).toBeTruthy()
    await waitFor(() => expect(tableCount('member')).toBe('3'))
    expect(tableCount('alquiler')).toBe('2')

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer datos' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: '¿Restablecer los datos?' })).getByRole('button', { name: 'Restablecer' }))
    expect(await screen.findByText('Datos restablecidos al estado original del examen.')).toBeTruthy()
    await waitFor(() => expect(tableCount('member')).toBe('4'))
  })

  it('la consola ejecuta SQL y muestra errores de la BD', async () => {
    render(<Punto2Page />)
    const consola = document.getElementById('consola')!
    const input = within(consola).getByRole('textbox')

    fireEvent.change(input, { target: { value: "SELECT title FROM dvd WHERE genre = 'Children' ORDER BY title;" } })
    fireEvent.click(within(consola).getByRole('button', { name: 'Ejecutar' }))
    expect(await within(consola).findByText('Harry Potter and the GOF')).toBeTruthy()
    expect(within(consola).getByText('2 filas')).toBeTruthy()

    fireEvent.change(input, { target: { value: 'DROP TABLE dvd;' } })
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
    expect(await within(consola).findByText(/Sentencia no permitida: DROP/)).toBeTruthy()
  })

  it('"Abrir en la consola" copia el SQL del punto', async () => {
    render(<Punto2Page />)
    fireEvent.click(within(document.getElementById('punto-a')!).getByRole('button', { name: 'Abrir en la consola' }))
    const input = within(document.getElementById('consola')!).getByRole('textbox') as HTMLTextAreaElement
    expect(input.value).toContain('JOIN dvdactor da')
  })
})
