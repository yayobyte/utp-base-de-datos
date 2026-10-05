import { fetchPunto2Tables, resetData, runScript, runSql, type Punto2Tables, type SqlResult } from '@/data'
import { EXAM_QUERIES, type ExamPointId } from '@/domain/punto2/examQueries'

/** Casos de uso del punto 2: la UI solo habla con este módulo. */
export const punto2Service = {
  loadTables(): Promise<Punto2Tables> {
    return fetchPunto2Tables()
  },

  runExamPoint(id: ExamPointId): Promise<SqlResult> {
    const query = EXAM_QUERIES.find((q) => q.id === id)
    if (!query) throw new Error(`Punto desconocido: ${id}`)
    return runSql(query.statements)
  },

  runConsole(script: string): Promise<SqlResult> {
    return runScript(script)
  },

  reset(): Promise<void> {
    return resetData()
  },
}
