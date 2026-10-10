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

/** Filas de muestra por tabla en el diagrama. */
const SAMPLE_ROWS = 10

export interface TallerColumn {
  name: string
  type: string
  nullable: boolean
  pk: boolean
  /** Tabla referenciada si la columna es (o se infiere) llave foránea. */
  fk?: string
}

export interface TallerSchemaTable {
  name: string
  kind: 'table' | 'view'
  columns: TallerColumn[]
  /** Primeras filas (máximo SAMPLE_ROWS). */
  rows: Row[]
  total: number
}

export interface TallerRelation {
  from: string
  fromColumns: string[]
  to: string
  toColumns: string[]
  /** true = deducida por nombre de columna (la tabla no declara FOREIGN KEY). */
  inferred: boolean
}

export interface TallerSchema {
  tables: TallerSchemaTable[]
  relations: TallerRelation[]
}

/** Esquema de public (tablas, columnas, PK/FK) con una muestra de filas, para el diagrama. */
export async function fetchTallerSchema(id: string, setupSql: string): Promise<TallerSchema> {
  const db = await getTallerDb(id, setupSql)
  const [list, cols, keys] = await Promise.all([
    db.query<{ name: string; kind: string }>(
      `select table_name as name, table_type as kind from information_schema.tables
       where table_schema = 'public' order by table_name`,
    ),
    db.query<{ table: string; name: string; type: string; nullable: boolean }>(
      `select c.table_name as "table", c.column_name as name,
              case when c.character_maximum_length is not null then c.data_type || '(' || c.character_maximum_length || ')'
                   when c.data_type = 'numeric' and c.numeric_precision is not null then 'numeric(' || c.numeric_precision || ',' || c.numeric_scale || ')'
                   else c.data_type end as type,
              c.is_nullable = 'YES' as nullable
       from information_schema.columns c where c.table_schema = 'public'
       order by c.table_name, c.ordinal_position`,
    ),
    db.query<{ kind: string; table: string; columns: string[]; ref: string | null; ref_columns: string[] | null }>(
      `select con.contype as kind, rel.relname as "table",
              array(select a.attname::text from unnest(con.conkey) with ordinality k(n, i)
                    join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k.n order by k.i) as columns,
              frel.relname as ref,
              array(select a.attname::text from unnest(con.confkey) with ordinality k(n, i)
                    join pg_attribute a on a.attrelid = con.confrelid and a.attnum = k.n order by k.i) as ref_columns
       from pg_constraint con
       join pg_class rel on rel.oid = con.conrelid
       join pg_namespace ns on ns.oid = rel.relnamespace
       left join pg_class frel on frel.oid = con.confrelid
       where ns.nspname = 'public' and con.contype in ('p', 'f')
       order by rel.relname, con.conname`,
    ),
  ])

  const declared: TallerRelation[] = keys.rows
    .filter((k) => k.kind === 'f' && k.ref)
    .map((k) => ({ from: k.table, fromColumns: k.columns, to: k.ref!, toColumns: k.ref_columns ?? [], inferred: false }))
  const pks = new Map(keys.rows.filter((k) => k.kind === 'p').map((k) => [k.table, new Set(k.columns)]))

  const tables: TallerSchemaTable[] = []
  for (const t of list.rows) {
    const ident = `"${t.name.replace(/"/g, '""')}"`
    let rows: Row[] = []
    let total = 0
    try {
      rows = (await db.query<Row>(`select * from public.${ident} limit ${SAMPLE_ROWS}`)).rows
      total = (await db.query<{ n: number }>(`select count(*)::int as n from public.${ident}`)).rows[0].n
    } catch {
      // Vista rota: se muestra sin filas.
    }
    tables.push({
      name: t.name,
      kind: t.kind === 'VIEW' ? 'view' : 'table',
      columns: cols.rows
        .filter((c) => c.table === t.name)
        .map((c) => ({ name: c.name, type: shortType(c.type), nullable: c.nullable, pk: pks.get(t.name)?.has(c.name) ?? false })),
      rows,
      total,
    })
  }

  const relations = [...declared, ...inferRelations(tables, declared)]
  for (const r of relations) {
    const table = tables.find((t) => t.name === r.from)
    for (const name of r.fromColumns) {
      const col = table?.columns.find((c) => c.name === name)
      if (col) col.fk = r.to
    }
  }
  return { tables, relations }
}

/** Nombres de tipo como se escriben en los scripts de clase (varchar(30), no character varying(30)). */
function shortType(type: string): string {
  return type
    .replace('character varying', 'varchar')
    .replace('timestamp without time zone', 'timestamp')
    .replace('timestamp with time zone', 'timestamptz')
    .replace(/^character\b/, 'char')
}

/**
 * Esquemas sin ninguna FOREIGN KEY declarada (p. ej. DreamHome): una columna que se llama igual que la
 * primera columna de otra tabla (su identificador: branchno, staffno…) se toma como referencia.
 * Si el esquema declara llaves foráneas, no se deduce nada (se confía en lo declarado).
 */
function inferRelations(tables: TallerSchemaTable[], declared: TallerRelation[]): TallerRelation[] {
  if (declared.length > 0) return []
  // Dueño de cada identificador: la tabla cuyo nombre más se parece a la columna (client → clientno);
  // las tablas que solo lo repiten como primera columna (viewing, registration) no lo son.
  const owners = new Map<string, string>()
  const affinity = (table: string, column: string) => {
    let n = 0
    while (n < table.length && table[n] === column[n]) n++
    return n
  }
  for (const t of tables) {
    const first = t.columns[0]?.name
    if (t.kind !== 'table' || !first) continue
    const current = owners.get(first)
    if (!current || affinity(t.name, first) > affinity(current, first)) owners.set(first, t.name)
  }
  const inferred: TallerRelation[] = []
  for (const t of tables) {
    if (t.kind !== 'table') continue
    for (const c of t.columns) {
      const owner = owners.get(c.name)
      if (owner && owner !== t.name) inferred.push({ from: t.name, fromColumns: [c.name], to: owner, toColumns: [c.name], inferred: true })
    }
  }
  return inferred
}
