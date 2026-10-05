import type { SqlResult } from '@/data'
import type { ExamQuery } from '@/domain/punto2/examQueries'

export type ExamPointTab = 'sql' | 'js' | 'explicacion'

export interface ExamPointCardProps {
  query: ExamQuery
  /** Ejecuta la pregunta; el padre recarga las tablas después. */
  onRun: (query: ExamQuery) => Promise<SqlResult>
  /** Abre la consola con el SQL de esta pregunta. */
  onOpenInConsole: (query: ExamQuery) => void
}
