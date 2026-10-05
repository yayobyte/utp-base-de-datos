import { getClient } from '../clients'
import { DataError } from '../orm/DataError'
import type { Row, SqlResult } from '../orm/types'

/** Tablas del punto 2 (esquema `examen`, imágenes del examen), en el orden en que se muestran. */
export const PUNTO2_TABLES = [
  'distributioncenter',
  'staff',
  'dvd',
  'actor',
  'dvdactor',
  'member',
  'tipomembrecia',
  'deseo',
  'alquiler',
  'dvdrental',
  'dvdcopy',
] as const

export type Punto2Table = (typeof PUNTO2_TABLES)[number]

interface RunSqlResponse {
  columns?: string[]
  rows?: Row[] | null
  rowCount?: number
}

/**
 * Divide un script en sentencias: un ';' al final de línea termina la sentencia.
 * Ignora líneas vacías y comentarios de línea (--) fuera de las sentencias.
 */
export function splitStatements(script: string): string[] {
  const statements: string[] = []
  let current: string[] = []
  for (const line of script.split('\n')) {
    current.push(line)
    if (/;\s*(--.*)?$/.test(line)) {
      statements.push(current.join('\n'))
      current = []
    }
  }
  statements.push(current.join('\n'))
  return statements
    .map((s) =>
      s
        .split('\n')
        .filter((l) => !/^\s*--/.test(l))
        .join('\n')
        .trim()
        .replace(/;\s*$/, '')
        .trim(),
    )
    .filter(Boolean)
}

/** Ejecuta sentencias SQL reales en la BD #2 vía la RPC restringida `run_sql`. Devuelve el resultado de la última. */
export async function runSql(statements: string[]): Promise<SqlResult> {
  if (statements.length === 0) throw new DataError('No hay sentencias para ejecutar', 'query_failed')
  const started = performance.now()
  const { data, error } = await getClient('p2').rpc('run_sql', { statements })
  const durationMs = Math.round(performance.now() - started)
  if (error) throw DataError.from(error)
  const res = (data ?? {}) as RunSqlResponse
  const rows = res.rows ?? []
  return {
    columns: res.columns ?? Object.keys(rows[0] ?? {}),
    rows,
    rowCount: res.rowCount ?? rows.length,
    durationMs,
  }
}

/** Ejecuta un script (varias sentencias separadas por ';' al final de línea). */
export function runScript(script: string): Promise<SqlResult> {
  return runSql(splitStatements(script))
}

/** Restaura todas las tablas del punto 2 desde el esquema `baseline`. */
export async function resetData(): Promise<void> {
  const { error } = await getClient('p2').rpc('reset_data')
  if (error) throw DataError.from(error)
}

export type Punto2Tables = Record<Punto2Table, Row[]>

/**
 * Lee las 11 tablas en una sola llamada (RPC `punto2_tables`).
 * El esquema `examen` no se expone en la Data API, por eso no se usa Repository aquí.
 */
export async function fetchPunto2Tables(): Promise<Punto2Tables> {
  const { data, error } = await getClient('p2').rpc('punto2_tables')
  if (error) throw DataError.from(error)
  const res = (data ?? {}) as Partial<Punto2Tables>
  return Object.fromEntries(PUNTO2_TABLES.map((t) => [t, res[t] ?? []])) as Punto2Tables
}
