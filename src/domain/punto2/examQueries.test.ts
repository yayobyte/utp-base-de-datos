// @vitest-environment node
import type { PGlite } from '@electric-sql/pglite'
import { migratedDb } from '@/test/pglite'
import { EXAM_QUERIES, toScript, toSupabaseJs, type ExamPointId } from './examQueries'
import { splitStatements } from '@/data/punto2/sqlRunner'

type Row = Record<string, unknown>
interface RunResult {
  rows: Row[]
  rowCount: number
}

let db: PGlite

/** Llama a public.run_sql como lo hace la app (rol anon). */
async function runSql(statements: string[]): Promise<RunResult> {
  const r = await db.query<{ r: RunResult }>('select public.run_sql($1::text[]) as r', [statements])
  return r.rows[0].r
}

const query = (id: ExamPointId) => EXAM_QUERIES.find((q) => q.id === id)!

beforeAll(async () => {
  db = await migratedDb('punto-2')
  await db.exec('set role anon')
}, 30_000)

afterAll(async () => {
  await db.close()
})

beforeEach(async () => {
  await db.query('select public.reset_data()')
})

describe('migración punto 2 (examen)', () => {
  it('crea las 11 tablas con los datos del enunciado', async () => {
    const r = await db.query<{ t: Record<string, Row[]> }>('select public.punto2_tables() as t')
    const counts = Object.fromEntries(Object.entries(r.rows[0].t).map(([k, v]) => [k, v.length]))
    expect(counts).toEqual({
      distributioncenter: 4,
      staff: 6,
      dvd: 6,
      actor: 6,
      dvdactor: 7,
      member: 4,
      tipomembrecia: 3,
      deseo: 5,
      alquiler: 4,
      dvdrental: 4,
      dvdcopy: 4,
    })
  })

  it('health() registra la migración del punto 2', async () => {
    const r = await db.query<{ h: { version: string; migraciones: number } }>('select public.health() as h')
    expect(r.rows[0].h).toMatchObject({ version: '20261004010000', migraciones: 2 })
  })
})

describe('respuestas a–e', () => {
  it('a: películas con actores y personajes', async () => {
    const r = await runSql(query('a').statements)
    expect(r.rowCount).toBe(7)
    expect(r.rows).toContainEqual({ title: 'Lord of the Rings III', actorname: 'Ian McKellen', character: 'Gandalf' })
    expect(Object.keys(r.rows[0])).toEqual(['title', 'actorname', 'character'])
  })

  it('b: 4 alquileres, 1 sin devolver (Serena Parker, War of the Worlds)', async () => {
    const r = await runSql(query('b').statements)
    expect(r.rowCount).toBe(4)
    const pending = r.rows.filter((row) => row.estado === 'No devuelta')
    expect(pending).toEqual([
      expect.objectContaining({ title: 'War of the Worlds', dvdno: '17864331', alquilado_por: 'Serena Parker', fechaentrega: null }),
    ])
  })

  it('c: ingreso mensual = 51.96', async () => {
    const r = await runSql(query('c').statements)
    expect(Number(r.rows[0].ingreso_mensual)).toBeCloseTo(51.96, 2)
  })

  it('d: elimina a Serena Parker y todo lo suyo', async () => {
    const r = await runSql(query('d').statements)
    expect(r.rows.map((m) => m.memberno)).toEqual(['M166884', 'M250178', 'M284354'])
    const left = await runSql([
      "SELECT (SELECT count(*) FROM deseo WHERE memberNo = 'M115656') + (SELECT count(*) FROM alquiler WHERE memberNo = 'M115656') + (SELECT count(*) FROM dvdrental WHERE deliveryNo IN ('R66825673','R66818964')) AS n",
    ])
    expect(Number(left.rows[0].n)).toBe(0)
  })

  it('e: 2 % sobre el promedio, 3 % al resto (promedio 42 000)', async () => {
    const r = await runSql(query('e').statements)
    const salary = Object.fromEntries(r.rows.map((s) => [s.staffno, Number(s.salary)]))
    expect(salary).toEqual({
      S0003: 30900, // 30 000 · 1.03
      S0010: 52020, // 51 000 · 1.02
      S0415: 43260, // 42 000 = promedio → 1.03
      S1500: 48960, // 48 000 · 1.02
      S2250: 48960,
      S3250: 33990, // 33 000 · 1.03
    })
  })

  it('el script de consola produce las mismas sentencias', () => {
    for (const q of EXAM_QUERIES) expect(splitStatements(toScript(q))).toEqual(q.statements)
  })

  it('el equivalente supabase-js llama a run_sql', () => {
    expect(toSupabaseJs(query('c'))).toContain("supabase.rpc('run_sql'")
  })
})

describe('seguridad de run_sql', () => {
  it.each(['DROP TABLE dvd', 'CREATE TABLE x (a int)', 'TRUNCATE dvd', 'ALTER TABLE dvd ADD COLUMN x int', 'GRANT ALL ON dvd TO anon'])(
    'rechaza %s',
    async (sql) => {
      await expect(runSql([sql])).rejects.toThrow(/no permitida/)
    },
  )

  it('rechaza varias sentencias en un mismo elemento', async () => {
    await expect(runSql(['SELECT 1; DELETE FROM dvd'])).rejects.toThrow(/Una sentencia por elemento/)
  })

  it('anon no puede leer baseline', async () => {
    await expect(runSql(['SELECT * FROM baseline.dvd'])).rejects.toThrow(/permission denied/)
  })

  it('es atómico: si una sentencia falla no se aplica ninguna', async () => {
    await expect(runSql(["DELETE FROM dvd WHERE catalogNo = '207132'", 'SELECT * FROM no_existe'])).rejects.toThrow()
    const r = await runSql(['SELECT count(*) AS n FROM dvd'])
    expect(Number(r.rows[0].n)).toBe(6)
  })

  it('reset_data restaura los datos', async () => {
    await runSql(query('d').statements)
    await db.query('select public.reset_data()')
    const r = await runSql(['SELECT count(*) AS n FROM member'])
    expect(Number(r.rows[0].n)).toBe(4)
  })

  it('un SELECT con ";" dentro de un texto es válido', async () => {
    const r = await runSql(["SELECT 'a;b' AS texto"])
    expect(r.rows[0].texto).toBe('a;b')
  })
})
