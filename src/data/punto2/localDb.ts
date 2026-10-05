import type { PGlite } from '@electric-sql/pglite'
import healthSql from '../../../databases/punto-2/supabase/migrations/20261004000000_health.sql?raw'
import examenSql from '../../../databases/punto-2/supabase/migrations/20261004010000_examen_dvd.sql?raw'
import { DataError } from '../orm/DataError'

/**
 * Motor del punto 2: PostgreSQL real (PGlite, WebAssembly) dentro del navegador.
 * Aplica las mismas migraciones de databases/punto-2 que se prueban en CI, sin necesitar Supabase.
 * Cada visitante tiene su propia copia; recargar la página vuelve a los datos originales.
 */

/** Lo mínimo que Supabase trae de fábrica y que las migraciones esperan. */
const SUPABASE_ROLES = 'create role anon nologin; create role authenticated nologin;'

let instance: Promise<PGlite> | undefined

async function createDb(): Promise<PGlite> {
  const { PGlite } = await import('@electric-sql/pglite')
  const db = await PGlite.create()
  await db.exec(SUPABASE_ROLES)
  await db.exec(healthSql)
  await db.exec(examenSql)
  // La app usa la BD con los mismos permisos que tendría la key pública en Supabase.
  await db.exec('set role anon')
  return db
}

/** BD local (se crea una sola vez, al primer uso). */
export function getLocalDb(): Promise<PGlite> {
  instance ??= createDb().catch((e: unknown) => {
    instance = undefined
    throw new DataError(`No se pudo iniciar PostgreSQL en el navegador: ${(e as Error).message}`, 'network')
  })
  return instance
}

/** Llama a una función de `public` como lo haría `supabase.rpc(fn, params)`. */
export async function callLocal<T>(fn: string, params: Record<string, unknown> = {}): Promise<T> {
  const db = await getLocalDb()
  const names = Object.keys(params)
  const args = names.map((n, i) => `${n} => $${i + 1}`).join(', ')
  try {
    const r = await db.query<{ r: T }>(`select public.${fn}(${args}) as r`, names.map((n) => params[n]))
    return r.rows[0]?.r as T
  } catch (e) {
    throw new DataError((e as Error).message, 'query_failed')
  }
}
