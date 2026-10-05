import { setClientForTesting } from '../clients'
import { fakeSupabase } from '../testing/fakeSupabase'
import { fetchPunto2Tables, resetData, runScript, runSql, splitStatements } from './sqlRunner'

afterEach(() => setClientForTesting('p2', null))

describe('splitStatements', () => {
  it('separa por ";" al final de línea e ignora comentarios', () => {
    const script = `-- punto d
DELETE FROM deseo WHERE memberNo = 'M115656';
DELETE FROM member
 WHERE mFName = 'Serena';

SELECT 'a;b' AS texto`
    expect(splitStatements(script)).toEqual([
      "DELETE FROM deseo WHERE memberNo = 'M115656'",
      "DELETE FROM member\n WHERE mFName = 'Serena'",
      "SELECT 'a;b' AS texto",
    ])
  })

  it('devuelve [] para un script vacío', () => {
    expect(splitStatements('  \n -- nada \n')).toEqual([])
  })
})

describe('runSql', () => {
  it('llama a la RPC run_sql y normaliza el resultado', async () => {
    const fake = fakeSupabase({ data: { columns: ['ingreso_mensual'], rows: [{ ingreso_mensual: 51.96 }], rowCount: 1 } })
    setClientForTesting('p2', fake.client)

    const res = await runScript('SELECT SUM(cargoMes) AS ingreso_mensual FROM tipomembrecia;')

    expect(fake.calls[0]).toEqual({
      method: 'rpc',
      args: ['run_sql', { statements: ['SELECT SUM(cargoMes) AS ingreso_mensual FROM tipomembrecia'] }],
    })
    expect(res.columns).toEqual(['ingreso_mensual'])
    expect(res.rows[0].ingreso_mensual).toBe(51.96)
    expect(res.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('infiere columnas si la RPC no las envía', async () => {
    setClientForTesting('p2', fakeSupabase({ data: { rows: [{ a: 1, b: 2 }] } }).client)
    const res = await runSql(['SELECT 1 AS a, 2 AS b'])
    expect(res.columns).toEqual(['a', 'b'])
    expect(res.rowCount).toBe(1)
  })

  it('rechaza listas vacías y propaga errores como DataError', async () => {
    await expect(runSql([])).rejects.toMatchObject({ name: 'DataError' })
    setClientForTesting('p2', fakeSupabase({ error: { message: 'Sentencia no permitida: DROP' } }).client)
    await expect(runSql(['DROP TABLE dvd'])).rejects.toThrow('Sentencia no permitida')
  })

  it('resetData llama a la RPC reset_data', async () => {
    const fake = fakeSupabase({ data: null })
    setClientForTesting('p2', fake.client)
    await resetData()
    expect(fake.calls[0].args[0]).toBe('reset_data')
  })
})

describe('fetchPunto2Tables', () => {
  it('llama a punto2_tables y completa las tablas que falten con []', async () => {
    const fake = fakeSupabase({ data: { dvd: [{ catalogno: '207132' }] } })
    setClientForTesting('p2', fake.client)
    const tables = await fetchPunto2Tables()
    expect(fake.calls[0].args[0]).toBe('punto2_tables')
    expect(tables.dvd).toHaveLength(1)
    expect(tables.staff).toEqual([])
    expect(Object.keys(tables)).toHaveLength(11)
  })
})
