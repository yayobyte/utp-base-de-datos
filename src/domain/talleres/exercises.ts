/** Un ejercicio de un taller: bloque de SQL con su título (p. ej. «a. Elementos del catálogo…»). */
export interface TallerExercise {
  id: string
  title: string
  /** Comentarios que acompañan al título (sin «--»). */
  notes: string[]
  sql: string
}

const RULE = /^--\s*=+\s*$/

/**
 * Divide un archivo de soluciones en ejercicios. Cada ejercicio empieza con una cabecera:
 *
 *   -- ======
 *   -- a. Título
 *   --   notas opcionales
 *   -- ======
 *   <sql>
 *
 * Lo que va antes de la primera cabecera se ignora.
 */
export function parseExercises(source: string): TallerExercise[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const exercises: TallerExercise[] = []
  let i = 0
  while (i < lines.length) {
    if (!RULE.test(lines[i])) {
      i++
      continue
    }
    const header: string[] = []
    i++
    while (i < lines.length && !RULE.test(lines[i])) header.push(lines[i++].replace(/^--\s?/, ''))
    i++
    const body: string[] = []
    while (i < lines.length && !RULE.test(lines[i])) body.push(lines[i++])
    const [title = '', ...notes] = header
    exercises.push({
      id: `ej-${exercises.length + 1}`,
      title: title.trim(),
      notes: notes.map((n) => n.trim()).filter(Boolean),
      sql: body.join('\n').trim(),
    })
  }
  return exercises.filter((e) => e.title && e.sql)
}
