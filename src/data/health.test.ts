import { setClientForTesting } from './clients'
import { checkHealth } from './health'
import { fakeSupabase } from './testing/fakeSupabase'

afterEach(() => {
  setClientForTesting('p1', null)
  vi.unstubAllEnvs()
})

describe('checkHealth', () => {
  it('informa "no configurado" sin variables de entorno, sin llamar a la BD', async () => {
    vi.stubEnv('VITE_P1_SUPABASE_URL', '')
    const fake = fakeSupabase()
    setClientForTesting('p1', fake.client)
    expect(await checkHealth('p1')).toMatchObject({ configured: false, ok: false })
    expect(fake.calls).toHaveLength(0)
  })

  it('devuelve versión y migraciones cuando la RPC responde', async () => {
    vi.stubEnv('VITE_P1_SUPABASE_URL', 'https://demo.supabase.co')
    vi.stubEnv('VITE_P1_SUPABASE_ANON_KEY', 'anon')
    const fake = fakeSupabase({ data: { ok: true, version: '20261004000000', migraciones: 1, hora_servidor: 't' } })
    setClientForTesting('p1', fake.client)
    const r = await checkHealth('p1')
    expect(fake.calls[0].args[0]).toBe('health')
    expect(r).toMatchObject({ configured: true, ok: true, version: '20261004000000', migrations: 1 })
  })

  it('no lanza si la RPC falla (p. ej. migración no aplicada)', async () => {
    vi.stubEnv('VITE_P1_SUPABASE_URL', 'https://demo.supabase.co')
    vi.stubEnv('VITE_P1_SUPABASE_ANON_KEY', 'anon')
    setClientForTesting('p1', fakeSupabase({ error: { message: 'Could not find the function public.health' } }).client)
    const r = await checkHealth('p1')
    expect(r.ok).toBe(false)
    expect(r.error).toContain('public.health')
  })
})
