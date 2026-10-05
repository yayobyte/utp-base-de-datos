import type { PGlite } from '@electric-sql/pglite'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente supabase-js mínimo sobre PGlite (solo pruebas): traduce a SQL el subconjunto de la API
 * que usa src/data (select/eq/is/in/order/limit, insert, upsert, update, delete, count y rpc),
 * para probar servicios y páginas contra las migraciones reales sin Supabase.
 */
type Filter = { op: 'eq' | 'is' | 'in'; column: string; value: unknown }

const ident = (name: string) => `"${name.replace(/"/g, '""')}"`

class QueryBuilder implements PromiseLike<{ data: unknown; error: { message: string } | null; count: number | null }> {
  private kind: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select'
  private columns = '*'
  private filters: Filter[] = []
  private orders: { column: string; ascending: boolean }[] = []
  private limitN?: number
  private values: Record<string, unknown>[] = []
  private patch: Record<string, unknown> = {}
  private onConflict?: string
  private returning = false
  private countMode = false
  private head = false

  private db: PGlite
  private table: string

  constructor(db: PGlite, table: string) {
    this.db = db
    this.table = table
  }

  select(columns = '*', opts?: { count?: string; head?: boolean }) {
    if (this.kind === 'select') {
      this.columns = columns
      this.countMode = Boolean(opts?.count)
      this.head = Boolean(opts?.head)
    } else this.returning = true
    return this
  }
  eq(column: string, value: unknown) {
    this.filters.push({ op: 'eq', column, value })
    return this
  }
  is(column: string, value: unknown) {
    this.filters.push({ op: 'is', column, value })
    return this
  }
  in(column: string, value: unknown[]) {
    this.filters.push({ op: 'in', column, value })
    return this
  }
  order(column: string, opts?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: opts?.ascending ?? true })
    return this
  }
  limit(n: number) {
    this.limitN = n
    return this
  }
  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.kind = 'insert'
    this.values = Array.isArray(values) ? values : [values]
    return this
  }
  upsert(values: Record<string, unknown> | Record<string, unknown>[], opts?: { onConflict?: string }) {
    this.kind = 'upsert'
    this.values = Array.isArray(values) ? values : [values]
    this.onConflict = opts?.onConflict
    return this
  }
  update(patch: Record<string, unknown>) {
    this.kind = 'update'
    this.patch = patch
    return this
  }
  delete() {
    this.kind = 'delete'
    return this
  }

  private where(params: unknown[]): string {
    if (!this.filters.length) return ''
    const parts = this.filters.map((f) => {
      if (f.op === 'is') return `${ident(f.column)} is null`
      if (f.op === 'in') {
        const list = (f.value as unknown[]).map((v) => {
          params.push(v)
          return `$${params.length}`
        })
        return list.length ? `${ident(f.column)} in (${list.join(', ')})` : 'false'
      }
      params.push(f.value)
      return `${ident(f.column)} = $${params.length}`
    })
    return ` where ${parts.join(' and ')}`
  }

  private async run() {
    const params: unknown[] = []
    const t = `public.${ident(this.table)}`
    const ret = this.returning ? ' returning *' : ''
    let sql: string
    switch (this.kind) {
      case 'select': {
        if (this.columns.includes('(')) throw new Error('El adaptador de pruebas no soporta selects anidados')
        const cols = this.columns === '*' ? '*' : this.columns.split(',').map((c) => ident(c.trim())).join(', ')
        if (this.countMode && this.head) {
          sql = `select count(*)::int as n from ${t}${this.where(params)}`
          const r = await this.db.query<{ n: number }>(sql, params)
          return { data: null, error: null, count: r.rows[0].n }
        }
        const order = this.orders.length ? ` order by ${this.orders.map((o) => `${ident(o.column)} ${o.ascending ? 'asc' : 'desc'}`).join(', ')}` : ''
        const limit = this.limitN !== undefined ? ` limit ${this.limitN}` : ''
        sql = `select ${cols} from ${t}${this.where(params)}${order}${limit}`
        break
      }
      case 'insert':
      case 'upsert': {
        if (!this.values.length) return { data: [], error: null, count: null }
        const keys = [...new Set(this.values.flatMap((v) => Object.keys(v)))]
        const rows = this.values.map(
          (v) =>
            `(${keys
              .map((k) => {
                if (v[k] === undefined) return 'default'
                params.push(v[k])
                return `$${params.length}`
              })
              .join(', ')})`,
        )
        let conflict = ''
        if (this.kind === 'upsert' && this.onConflict) {
          const keyCols = this.onConflict.split(',').map((c) => c.trim())
          const setCols = keys.filter((k) => !keyCols.includes(k))
          conflict = ` on conflict (${keyCols.map(ident).join(', ')}) do ${
            setCols.length ? `update set ${setCols.map((k) => `${ident(k)} = excluded.${ident(k)}`).join(', ')}` : 'nothing'
          }`
        }
        sql = `insert into ${t} (${keys.map(ident).join(', ')}) values ${rows.join(', ')}${conflict}${ret}`
        break
      }
      case 'update': {
        const sets = Object.entries(this.patch).map(([k, v]) => {
          params.push(v)
          return `${ident(k)} = $${params.length}`
        })
        sql = `update ${t} set ${sets.join(', ')}${this.where(params)}${ret}`
        break
      }
      case 'delete':
        sql = `delete from ${t}${this.where(params)}${ret}`
        break
    }
    const r = await this.db.query(sql, params)
    return { data: this.kind === 'select' || this.returning ? r.rows : null, error: null, count: null }
  }

  then<R1, R2>(
    onfulfilled?: (v: { data: unknown; error: { message: string } | null; count: number | null }) => R1 | PromiseLike<R1>,
    onrejected?: (e: unknown) => R2 | PromiseLike<R2>,
  ): PromiseLike<R1 | R2> {
    return this.run()
      .catch((e: Error) => ({ data: null, error: { message: e.message }, count: null }))
      .then(onfulfilled, onrejected)
  }
}

export function pgliteSupabase(db: PGlite): SupabaseClient {
  return {
    from: (table: string) => new QueryBuilder(db, table),
    rpc: async (fn: string, params: Record<string, unknown> = {}) => {
      const names = Object.keys(params).filter((n) => params[n] !== undefined)
      const args = names.map((n, i) => `${n} => $${i + 1}`).join(', ')
      try {
        const r = await db.query<{ r: unknown }>(`select public.${fn}(${args}) as r`, names.map((n) => params[n]))
        return { data: r.rows[0]?.r ?? null, error: null }
      } catch (e) {
        return { data: null, error: { message: (e as Error).message } }
      }
    },
  } as unknown as SupabaseClient
}
