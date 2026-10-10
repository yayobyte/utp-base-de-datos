import type { PGlite } from '@electric-sql/pglite'
import { DataError } from '../orm/DataError'
import type { Row, SqlResult } from '../orm/types'

/**
 * Bases de datos de los talleres: un PostgreSQL (PGlite) por taller, dentro del navegador.
 * A diferencia del punto 2, la consola admite cualquier SQL (CREATE, ALTER, DROP, vistas…):
 * es la copia del propio visitante. Se guarda en IndexedDB, así que los cambios sobreviven
 * a recargar la página; «Restaurar» vuelve al script original.
 */

/** Tablas mostradas por taller (máximo de filas por tabla). */
const MAX_ROWS = 200

/** OIDs de date, timestamp y timestamptz: se devuelven tal como los escribe PostgreSQL (sin pasar por Date). */
const RAW_DATE_TYPES = [1082, 1114, 1184]

const instances = new Map<string, Promise<PGlite>>()

async function createDb(id: string, setupSql: string): Promise<PGlite> {
  const { PGlite } = await import('@electric-sql/pglite')
  const parsers = Object.fromEntries(RAW_DATE_TYPES.map((oid) => [oid, (v: string) => v]))
  // En pruebas (sin IndexedDB) la BD vive en memoria.
  const dataDir = typeof indexedDB === 'undefined' ? undefined : `idb://taller-${id}`
  const db = await PGlite.create(dataDir, { parsers })
  await db.exec('create schema if not exists _taller; create table if not exists _taller.setup (done_at timestamptz default now())')
  const done = await db.query('select 1 from _taller.setup limit 1')
  if (done.rows.length === 0) await loadSetup(db, setupSql)
  return db
}

async function loadSetup(db: PGlite, setupSql: string): Promise<void> {
  await db.exec(setupSql)
  await db.exec('delete from _taller.setup; insert into _taller.setup default values')
}

/** BD del taller (se crea, y se carga con su script, al primer uso). */
export function getTallerDb(id: string, setupSql: string): Promise<PGlite> {
  let instance = instances.get(id)
  if (!instance) {
    instance = createDb(id, setupSql).catch((e: unknown) => {
      instances.delete(id)
      throw new DataError(`No se pudo iniciar PostgreSQL en el navegador: ${(e as Error).message}`, 'network')
    })
    instances.set(id, instance)
  }
  return instance
}

/**
 * Ejecuta un script completo (cualquier SQL, varias sentencias). Devuelve el resultado
 * de la última sentencia que devuelve filas; si ninguna devuelve, las filas afectadas por la última.
 */
export async function runTallerScript(id: string, setupSql: string, script: string): Promise<SqlResult> {
  const db = await getTallerDb(id, setupSql)
  const started = performance.now()
  let results
  try {
    results = await db.exec(script)
  } catch (e) {
    // Si el script abrió una transacción y falló, se deshace para no dejar la BD bloqueada.
    await db.exec('rollback').catch(() => undefined)
    throw new DataError((e as Error).message, 'query_failed')
  }
  const durationMs = Math.round(performance.now() - started)
  const withRows = [...results].reverse().find((r) => r.fields.length > 0)
  if (withRows) {
    const rows = withRows.rows as Row[]
    return { columns: withRows.fields.map((f) => f.name), rows, rowCount: rows.length, durationMs }
  }
  // affectedRows es acumulado dentro de un mismo exec: la última sentencia aporta la diferencia.
  const last = results.at(-1)?.affectedRows ?? 0
  const prev = results.at(-2)?.affectedRows ?? 0
  return { columns: [], rows: [], rowCount: Math.max(last - prev, 0), durationMs }
}

export interface TallerTable {
  name: string
  kind: 'table' | 'view'
  rows: Row[]
  /** Total de filas (las mostradas pueden ser menos, ver MAX_ROWS). */
  total: number
}

/** Tablas y vistas del esquema public con sus filas. */
export async function fetchTallerTables(id: string, setupSql: string): Promise<TallerTable[]> {
  const db = await getTallerDb(id, setupSql)
  const list = await db.query<{ name: string; kind: string }>(
    `select table_name as name, table_type as kind from information_schema.tables
     where table_schema = 'public' order by table_type, table_name`,
  )
  const tables: TallerTable[] = []
  for (const t of list.rows) {
    const ident = `"${t.name.replace(/"/g, '""')}"`
    try {
      const rows = await db.query<Row>(`select * from public.${ident} limit ${MAX_ROWS}`)
      const total = await db.query<{ n: number }>(`select count(*)::int as n from public.${ident}`)
      tables.push({ name: t.name, kind: t.kind === 'VIEW' ? 'view' : 'table', rows: rows.rows, total: total.rows[0].n })
    } catch {
      // Una vista rota (p. ej. tras un DROP) no debe impedir ver el resto.
      tables.push({ name: t.name, kind: 'view', rows: [], total: 0 })
    }
  }
  return tables
}

/** Borra todo lo del esquema public y vuelve a ejecutar el script del taller. */
export async function resetTaller(id: string, setupSql: string): Promise<void> {
  const db = await getTallerDb(id, setupSql)
  try {
    await db.exec('drop schema public cascade; create schema public;')
    await loadSetup(db, setupSql)
  } catch (e) {
    throw new DataError((e as Error).message, 'query_failed')
  }
}
