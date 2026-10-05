import { getClient } from '../clients'
import { DataError } from './DataError'
import type { Filters, FindOptions, ProjectId, Row } from './types'

/**
 * Repositorio genérico tipo ORM sobre supabase-js.
 * Cada tabla se expone como `new Repository<Fila>('p1', 'tabla')`; las páginas nunca usan supabase directamente.
 */
export class Repository<T extends Row> {
  readonly project: ProjectId
  readonly table: string

  constructor(project: ProjectId, table: string) {
    this.project = project
    this.table = table
  }

  private from() {
    return getClient(this.project).from(this.table)
  }

  async findAll(options: FindOptions<T> = {}): Promise<T[]> {
    return this.findBy({}, options)
  }

  async findBy(filters: Filters<T>, options: FindOptions<T> = {}): Promise<T[]> {
    let query = this.from().select(options.select ?? '*')
    for (const [column, value] of Object.entries(filters)) {
      query = value === null ? query.is(column, null) : query.eq(column, value)
    }
    const orders = options.orderBy ? (Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy]) : []
    for (const o of orders) query = query.order(o.column, { ascending: o.ascending ?? true })
    if (options.limit !== undefined) query = query.limit(options.limit)
    const { data, error } = await query
    if (error) throw DataError.from(error)
    return (data ?? []) as unknown as T[]
  }

  /** Filas cuya columna está en la lista (WHERE col IN (...)). */
  async findIn(column: keyof T & string, values: unknown[], options: FindOptions<T> = {}): Promise<T[]> {
    if (values.length === 0) return []
    let query = this.from().select(options.select ?? '*').in(column, values as never[])
    const orders = options.orderBy ? (Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy]) : []
    for (const o of orders) query = query.order(o.column, { ascending: o.ascending ?? true })
    const { data, error } = await query
    if (error) throw DataError.from(error)
    return (data ?? []) as unknown as T[]
  }

  async findOne(filters: Filters<T>, options: Omit<FindOptions<T>, 'limit'> = {}): Promise<T | null> {
    const rows = await this.findBy(filters, { ...options, limit: 1 })
    return rows[0] ?? null
  }

  async getOne(filters: Filters<T>): Promise<T> {
    const row = await this.findOne(filters)
    if (!row) throw new DataError(`No existe el registro en ${this.table}`, 'not_found')
    return row
  }

  async count(filters: Filters<T> = {}): Promise<number> {
    let query = this.from().select('*', { count: 'exact', head: true })
    for (const [column, value] of Object.entries(filters)) {
      query = value === null ? query.is(column, null) : query.eq(column, value)
    }
    const { count, error } = await query
    if (error) throw DataError.from(error)
    return count ?? 0
  }

  async insert(values: Partial<T> | Partial<T>[]): Promise<T[]> {
    const { data, error } = await this.from().insert(values as Row | Row[]).select()
    if (error) throw DataError.from(error)
    return (data ?? []) as unknown as T[]
  }

  /** Inserta o actualiza según la llave indicada (`onConflict`: columnas separadas por coma). */
  async upsert(values: Partial<T> | Partial<T>[], onConflict: string): Promise<T[]> {
    const { data, error } = await this.from()
      .upsert(values as Row | Row[], { onConflict })
      .select()
    if (error) throw DataError.from(error)
    return (data ?? []) as unknown as T[]
  }

  async update(filters: Filters<T>, patch: Partial<T>): Promise<T[]> {
    this.assertFilters(filters, 'update')
    let query = this.from().update(patch as Row)
    for (const [column, value] of Object.entries(filters)) query = query.eq(column, value)
    const { data, error } = await query.select()
    if (error) throw DataError.from(error)
    return (data ?? []) as unknown as T[]
  }

  async remove(filters: Filters<T>): Promise<T[]> {
    this.assertFilters(filters, 'remove')
    let query = this.from().delete()
    for (const [column, value] of Object.entries(filters)) query = query.eq(column, value)
    const { data, error } = await query.select()
    if (error) throw DataError.from(error)
    return (data ?? []) as unknown as T[]
  }

  /** Evita UPDATE/DELETE sin WHERE por accidente. */
  private assertFilters(filters: Filters<T>, op: string) {
    if (Object.keys(filters).length === 0) {
      throw new DataError(`${op} en ${this.table} requiere al menos un filtro`, 'query_failed')
    }
  }
}
