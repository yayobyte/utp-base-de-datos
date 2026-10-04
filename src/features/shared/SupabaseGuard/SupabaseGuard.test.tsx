import { render, screen } from '@testing-library/react'
import { SupabaseGuard } from './SupabaseGuard'

describe('SupabaseGuard', () => {
  it('muestra las variables que faltan cuando no hay configuración', () => {
    render(
      <SupabaseGuard project="p2">
        <p>contenido</p>
      </SupabaseGuard>,
    )
    expect(screen.getByRole('heading', { name: 'Configura .env.local' })).toBeTruthy()
    expect(screen.getByText(/VITE_P2_SUPABASE_URL=/)).toBeTruthy()
    expect(screen.queryByText('contenido')).toBeNull()
  })
})
