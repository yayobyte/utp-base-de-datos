export type ProjectId = 'p1' | 'p2'

export type Row = Record<string, unknown>

export type OrderBy<T extends Row> = { column: keyof T & string; ascending?: boolean }

export interface FindOptions<T extends Row> {
  orderBy?: OrderBy<T> | OrderBy<T>[]
  limit?: number
  /** Columnas a seleccionar (sintaxis de supabase-js). Por defecto '*'. */
  select?: string
}

export type Filters<T extends Row> = Partial<T>

export interface SqlResult {
  columns: string[]
  rows: Row[]
  rowCount: number
  durationMs: number
}
