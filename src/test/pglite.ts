import { PGlite, types } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/** Roles que Supabase trae de fábrica (lo mínimo para las migraciones). */
const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
`

/**
 * Crea una BD Postgres en memoria (PGlite) y aplica las migraciones de un proyecto,
 * en orden, como lo haría Supabase. Solo para pruebas.
 * Los tipos se devuelven como los entrega la API de Supabase (PostgREST): numeric → number, fechas → texto.
 */
export async function migratedDb(workdir: 'punto-1' | 'punto-2'): Promise<PGlite> {
  const asText = (v: string) => v
  const db = new PGlite({
    parsers: {
      [types.NUMERIC]: (v: string) => Number(v),
      [types.DATE]: asText,
      [types.TIMESTAMPTZ]: asText,
      [types.TIMESTAMP]: asText,
      [types.TIME]: asText,
    },
  })
  await db.exec(SUPABASE_STUB)
  const dir = join(process.cwd(), 'databases', workdir, 'supabase', 'migrations')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(join(dir, file), 'utf8'))
  }
  return db
}
