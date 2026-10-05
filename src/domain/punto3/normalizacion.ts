/**
 * Punto 3 · Normalización de la tabla Préstamo (docs/examen/exam.md, docs/especificacion-punto-3.md).
 * Funciones puras: cada forma normal se CALCULA a partir de las filas de origen, así que si se editan
 * (modo sandbox) todas las tablas resultantes se recalculan.
 */

export interface PrestamoRow {
  codLibro: string
  titulo: string
  autor: string
  editorial: string
  nombreLector: string
  fechaDev: string
}

export type KeyKind = 'PK' | 'FK' | 'PK, FK'

export interface NfColumn {
  name: string
  key?: KeyKind
  /** Tabla a la que apunta la FK. */
  references?: string
  /** Columna nueva o modificada en este paso (se resalta). */
  changed?: boolean
}

export type NfValue = string | number
export type NfRow = Record<string, NfValue>

export interface NfTable {
  name: string
  columns: NfColumn[]
  rows: NfRow[]
}

export interface NfDependency {
  from: string[]
  to: string[]
  /** Por qué importa en este paso (p. ej. "parcial", "transitiva"). */
  note?: string
}

export type StepId = 'unf' | '1fn' | '2fn' | '3fn'

export interface NfStep {
  id: StepId
  label: string
  title: string
  explicacion: string
  cambios: string[]
  dependencias: NfDependency[]
  tables: NfTable[]
}

/** Tabla del enunciado. */
export const PRESTAMO_ORIGINAL: PrestamoRow[] = [
  { codLibro: '1001', titulo: 'Variable compleja', autor: 'Murray Spiegel', editorial: 'McGraw Hill', nombreLector: 'Pérez Gómez, Juan', fechaDev: '15/04/2005' },
  { codLibro: '1004', titulo: 'Visual Basic 5', autor: 'E. Petroustsos', editorial: 'Anaya', nombreLector: 'Ríos Terán, Ana', fechaDev: '17/04/2005' },
  { codLibro: '1005', titulo: 'Estadística', autor: 'Murray Spiegel', editorial: 'McGraw Hill', nombreLector: 'Roca, René', fechaDev: '16/04/2005' },
  { codLibro: '1006', titulo: 'Oracle University', autor: 'Nancy Greenberg y Priya Nathan', editorial: 'Oracle Corp.', nombreLector: 'García Roque, Luis', fechaDev: '20/04/2005' },
  { codLibro: '1007', titulo: 'Clipper 5.01', autor: 'Ramalho', editorial: 'McGraw Hill', nombreLector: 'Pérez Gómez, Juan', fechaDev: '18/04/2005' },
]

// ─── Utilidades ─────────────────────────────────────────────────────────────

const clean = (v: string) => v.trim().replace(/\s+/g, ' ')

/** "Nancy Greenberg y Priya Nathan" → ["Nancy Greenberg", "Priya Nathan"] (acepta "y", "e", "&", "," y ";"). */
export function splitAutores(autor: string): string[] {
  return autor
    .split(/\s*(?:,|;|&|\s+y\s+|\s+e\s+)\s*/i)
    .map(clean)
    .filter(Boolean)
}

/** "Pérez Gómez, Juan" → { apellidos: "Pérez Gómez", nombre: "Juan" }. Sin coma: todo son apellidos. */
export function splitLector(nombreLector: string): { apellidos: string; nombre: string } {
  const [apellidos, ...resto] = nombreLector.split(',')
  return { apellidos: clean(apellidos ?? ''), nombre: clean(resto.join(',')) }
}

/** Valores que aparecen más de una vez en una columna (para mostrar la redundancia). */
export function repeated(rows: PrestamoRow[], column: keyof PrestamoRow): { value: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(clean(r[column]), (counts.get(clean(r[column])) ?? 0) + 1)
  return [...counts].filter(([, n]) => n > 1).map(([value, count]) => ({ value, count }))
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((i) => {
    const k = key(i)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Asigna ids secuenciales (prefijo + número) por orden de aparición. */
function catalog(values: string[], prefix: string): Map<string, string> {
  const ids = new Map<string, string>()
  for (const v of values) if (!ids.has(v)) ids.set(v, `${prefix}${ids.size + 1}`)
  return ids
}

// ─── Paso 0: forma no normalizada ───────────────────────────────────────────

export function toUNF(rows: PrestamoRow[]): NfStep {
  const multivaluados = rows.filter((r) => splitAutores(r.autor).length > 1).map((r) => r.codLibro)
  const redundancia = [
    ...repeated(rows, 'editorial').map((r) => `Editorial «${r.value}» ×${r.count}`),
    ...repeated(rows, 'autor').map((r) => `Autor «${r.value}» ×${r.count}`),
    ...repeated(rows, 'nombreLector').map((r) => `Lector «${r.value}» ×${r.count}`),
  ]
  return {
    id: 'unf',
    label: '0FN',
    title: 'Tabla original (no normalizada)',
    explicacion:
      'Es la tabla tal como la entrega el enunciado. Mezcla datos de libros, autores, editoriales, lectores y préstamos en una sola relación, con valores no atómicos y mucha repetición.',
    cambios: [
      multivaluados.length
        ? `Autor es multivaluado en ${multivaluados.join(', ')} (varios autores en un mismo campo).`
        : 'No hay autores multivaluados en los datos actuales.',
      'NombreLector es compuesto: guarda apellidos y nombre en un solo campo ("Apellidos, Nombre").',
      redundancia.length ? `Redundancia: ${redundancia.join(' · ')}.` : 'No hay valores repetidos en los datos actuales.',
      'Anomalías: cambiar el nombre de una editorial obliga a editar varias filas (actualización); no se puede registrar un lector sin préstamo (inserción); borrar el único préstamo de un libro borra el libro (borrado).',
    ],
    dependencias: [{ from: ['CodLibro'], to: ['Titulo', 'Autor', 'Editorial', 'NombreLector', 'FechaDev'], note: 'clave candidata del enunciado' }],
    tables: [
      {
        name: 'Prestamo',
        columns: [
          { name: 'CodLibro', key: 'PK' },
          { name: 'Titulo' },
          { name: 'Autor', changed: true },
          { name: 'Editorial' },
          { name: 'NombreLector', changed: true },
          { name: 'FechaDev' },
        ],
        rows: rows.map((r) => ({
          CodLibro: r.codLibro,
          Titulo: r.titulo,
          Autor: r.autor,
          Editorial: r.editorial,
          NombreLector: r.nombreLector,
          FechaDev: r.fechaDev,
        })),
      },
    ],
  }
}

// ─── Paso 1: primera forma normal ───────────────────────────────────────────

export interface Fila1FN {
  CodLibro: string
  Titulo: string
  Autor: string
  Editorial: string
  ApellidosLector: string
  NombreLector: string
  FechaDev: string
}

export function filas1FN(rows: PrestamoRow[]): Fila1FN[] {
  return rows.flatMap((r) => {
    const { apellidos, nombre } = splitLector(r.nombreLector)
    return splitAutores(r.autor).map((autor) => ({
      CodLibro: clean(r.codLibro),
      Titulo: clean(r.titulo),
      Autor: autor,
      Editorial: clean(r.editorial),
      ApellidosLector: apellidos,
      NombreLector: nombre,
      FechaDev: clean(r.fechaDev),
    }))
  })
}

export function to1FN(rows: PrestamoRow[]): NfStep {
  const filas = filas1FN(rows)
  const extra = filas.length - rows.length
  return {
    id: '1fn',
    label: '1FN',
    title: 'Primera forma normal: valores atómicos',
    explicacion:
      'Una relación está en 1FN cuando cada celda tiene un solo valor indivisible. Se separan los autores en filas distintas y el nombre del lector en dos columnas. Como ahora un libro puede tener varias filas, CodLibro ya no identifica la fila: la clave pasa a ser (CodLibro, Autor).',
    cambios: [
      extra > 0 ? `Autor: un autor por fila (${extra} fila${extra === 1 ? '' : 's'} nueva${extra === 1 ? '' : 's'}; ${rows.length} → ${filas.length}).` : 'Autor: ya era atómico en todas las filas.',
      'NombreLector → ApellidosLector + NombreLector.',
      'Clave primaria: (CodLibro, Autor).',
    ],
    dependencias: [
      { from: ['CodLibro', 'Autor'], to: ['Titulo', 'Editorial', 'ApellidosLector', 'NombreLector', 'FechaDev'], note: 'clave primaria' },
      { from: ['CodLibro'], to: ['Titulo', 'Editorial', 'ApellidosLector', 'NombreLector', 'FechaDev'], note: 'parcial: viola la 2FN' },
    ],
    tables: [
      {
        name: 'Prestamo',
        columns: [
          { name: 'CodLibro', key: 'PK' },
          { name: 'Titulo' },
          { name: 'Autor', key: 'PK', changed: true },
          { name: 'Editorial' },
          { name: 'ApellidosLector', changed: true },
          { name: 'NombreLector', changed: true },
          { name: 'FechaDev' },
        ],
        rows: filas.map((f) => ({ ...f })),
      },
    ],
  }
}

// ─── Paso 2: segunda forma normal ───────────────────────────────────────────

export function to2FN(rows: PrestamoRow[]): NfStep {
  const filas = filas1FN(rows)
  const libros = uniqueBy(filas, (f) => f.CodLibro)
  return {
    id: '2fn',
    label: '2FN',
    title: 'Segunda forma normal: sin dependencias parciales',
    explicacion:
      'En 1FN, Titulo, Editorial, el lector y FechaDev dependen solo de CodLibro, que es una parte de la clave (CodLibro, Autor). Esa dependencia parcial se elimina llevando esos atributos a tablas cuya clave sea solo CodLibro. La relación libro–autor queda en su propia tabla.',
    cambios: [
      'Libro(CodLibro, Titulo, Editorial): datos que dependen solo del libro.',
      'LibroAutor(CodLibro, Autor): la relación M:N entre libros y autores.',
      'Prestamo(CodLibro, ApellidosLector, NombreLector, FechaDev): quién tiene el libro y cuándo lo devuelve.',
      `Las filas repetidas desaparecen: Libro y Prestamo tienen ${libros.length} filas, LibroAutor ${filas.length}.`,
    ],
    dependencias: [
      { from: ['CodLibro'], to: ['Titulo', 'Editorial'], note: 'Libro' },
      { from: ['CodLibro'], to: ['ApellidosLector', 'NombreLector', 'FechaDev'], note: 'Prestamo' },
      { from: ['CodLibro'], to: ['Editorial'], note: 'Editorial es una entidad propia → 3FN' },
      { from: ['ApellidosLector', 'NombreLector'], to: ['(datos del lector)'], note: 'el lector es una entidad propia → 3FN' },
    ],
    tables: [
      {
        name: 'Libro',
        columns: [{ name: 'CodLibro', key: 'PK' }, { name: 'Titulo' }, { name: 'Editorial' }],
        rows: libros.map((f) => ({ CodLibro: f.CodLibro, Titulo: f.Titulo, Editorial: f.Editorial })),
      },
      {
        name: 'LibroAutor',
        columns: [
          { name: 'CodLibro', key: 'PK, FK', references: 'Libro', changed: true },
          { name: 'Autor', key: 'PK' },
        ],
        rows: filas.map((f) => ({ CodLibro: f.CodLibro, Autor: f.Autor })),
      },
      {
        name: 'Prestamo',
        columns: [
          { name: 'CodLibro', key: 'PK, FK', references: 'Libro', changed: true },
          { name: 'ApellidosLector' },
          { name: 'NombreLector' },
          { name: 'FechaDev' },
        ],
        rows: libros.map((f) => ({
          CodLibro: f.CodLibro,
          ApellidosLector: f.ApellidosLector,
          NombreLector: f.NombreLector,
          FechaDev: f.FechaDev,
        })),
      },
    ],
  }
}

// ─── Paso 3: tercera forma normal ───────────────────────────────────────────

export function to3FN(rows: PrestamoRow[]): NfStep {
  const filas = filas1FN(rows)
  const libros = uniqueBy(filas, (f) => f.CodLibro)
  const editoriales = catalog(libros.map((f) => f.Editorial), 'E')
  const autores = catalog(filas.map((f) => f.Autor), 'A')
  const lectorKey = (f: Fila1FN) => `${f.ApellidosLector}|${f.NombreLector}`
  const lectores = catalog(libros.map(lectorKey), 'L')

  return {
    id: '3fn',
    label: '3FN',
    title: 'Tercera forma normal: sin dependencias transitivas',
    explicacion:
      'En 2FN, Libro guarda el nombre de la editorial y Prestamo los datos del lector: CodLibro → Editorial → (datos de la editorial) y CodLibro → Lector → (apellidos, nombre). Son dependencias transitivas a través de entidades que existen por sí mismas. Se crean Editorial, Autor y Lector con clave propia y las demás tablas solo guardan su id (llave foránea). Así cada dato se escribe una sola vez.',
    cambios: [
      `Editorial(IdEditorial, Nombre): ${editoriales.size} editoriales (antes repetidas en cada libro).`,
      `Autor(IdAutor, Nombre): ${autores.size} autores.`,
      `Lector(IdLector, Apellidos, Nombre): ${lectores.size} lectores.`,
      'Libro, LibroAutor y Prestamo guardan ids (FK) en lugar de nombres.',
      'Nota: la PK de Prestamo es CodLibro porque en los datos cada libro tiene un único préstamo; con historial de préstamos sería (CodLibro, FechaDev) o un IdPrestamo.',
    ],
    dependencias: [
      { from: ['IdEditorial'], to: ['Nombre'], note: 'Editorial' },
      { from: ['IdAutor'], to: ['Nombre'], note: 'Autor' },
      { from: ['IdLector'], to: ['Apellidos', 'Nombre'], note: 'Lector' },
      { from: ['CodLibro'], to: ['Titulo', 'IdEditorial'], note: 'Libro' },
      { from: ['CodLibro'], to: ['IdLector', 'FechaDev'], note: 'Prestamo' },
    ],
    tables: [
      {
        name: 'Editorial',
        columns: [
          { name: 'IdEditorial', key: 'PK', changed: true },
          { name: 'Nombre' },
        ],
        rows: [...editoriales].map(([nombre, id]) => ({ IdEditorial: id, Nombre: nombre })),
      },
      {
        name: 'Autor',
        columns: [
          { name: 'IdAutor', key: 'PK', changed: true },
          { name: 'Nombre' },
        ],
        rows: [...autores].map(([nombre, id]) => ({ IdAutor: id, Nombre: nombre })),
      },
      {
        name: 'Lector',
        columns: [
          { name: 'IdLector', key: 'PK', changed: true },
          { name: 'Apellidos' },
          { name: 'Nombre' },
        ],
        rows: [...lectores].map(([key, id]) => {
          const [apellidos, nombre] = key.split('|')
          return { IdLector: id, Apellidos: apellidos, Nombre: nombre }
        }),
      },
      {
        name: 'Libro',
        columns: [
          { name: 'CodLibro', key: 'PK' },
          { name: 'Titulo' },
          { name: 'IdEditorial', key: 'FK', references: 'Editorial', changed: true },
        ],
        rows: libros.map((f) => ({ CodLibro: f.CodLibro, Titulo: f.Titulo, IdEditorial: editoriales.get(f.Editorial)! })),
      },
      {
        name: 'LibroAutor',
        columns: [
          { name: 'CodLibro', key: 'PK, FK', references: 'Libro' },
          { name: 'IdAutor', key: 'PK, FK', references: 'Autor', changed: true },
        ],
        rows: filas.map((f) => ({ CodLibro: f.CodLibro, IdAutor: autores.get(f.Autor)! })),
      },
      {
        name: 'Prestamo',
        columns: [
          { name: 'CodLibro', key: 'PK, FK', references: 'Libro' },
          { name: 'IdLector', key: 'FK', references: 'Lector', changed: true },
          { name: 'FechaDev' },
        ],
        rows: libros.map((f) => ({ CodLibro: f.CodLibro, IdLector: lectores.get(lectorKey(f))!, FechaDev: f.FechaDev })),
      },
    ],
  }
}

/** Los cuatro pasos, en orden. */
export function normalize(rows: PrestamoRow[]): NfStep[] {
  return [toUNF(rows), to1FN(rows), to2FN(rows), to3FN(rows)]
}
