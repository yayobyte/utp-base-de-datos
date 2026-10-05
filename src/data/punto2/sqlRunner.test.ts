import { fetchPunto2Tables, resetData, runScript, runSql, splitStatements } from './sqlRunner'

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

describe('sqlRunner (PostgreSQL en el navegador)', () => {
  beforeEach(async () => {
    await resetData()
  }, 30_000)

  it('runScript ejecuta SQL real y conserva el orden de columnas', async () => {
    const res = await runScript('SELECT catalogNo, title FROM dvd ORDER BY catalogNo LIMIT 2;')
    expect(res.columns).toEqual(['catalogno', 'title'])
    expect(res.rows[0]).toEqual({ catalogno: '207132', title: 'Casino Royale' })
    expect(res.rowCount).toBe(2)
    expect(res.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('rechaza listas vacías y propaga errores de la BD como DataError', async () => {
    await expect(runSql([])).rejects.toMatchObject({ name: 'DataError' })
    await expect(runSql(['DROP TABLE dvd'])).rejects.toMatchObject({ name: 'DataError', message: expect.stringContaining('no permitida') })
  })

  it('fetchPunto2Tables devuelve las 11 tablas y resetData restaura', async () => {
    await runSql(["DELETE FROM dvd WHERE genre = 'Children'"])
    expect((await fetchPunto2Tables()).dvd).toHaveLength(4)
    await resetData()
    const tables = await fetchPunto2Tables()
    expect(tables.dvd).toHaveLength(6)
    expect(Object.keys(tables)).toHaveLength(11)
  })
})
