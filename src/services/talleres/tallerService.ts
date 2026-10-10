import { fetchTallerSchema, fetchTallerTables, resetTaller, runTallerScript, type SqlResult, type TallerSchema, type TallerTable } from '@/data'
import type { Taller } from '@/domain/talleres/catalog'

/** Casos de uso de los talleres: la UI solo habla con este módulo. */
export const tallerService = {
  loadTables(taller: Taller): Promise<TallerTable[]> {
    return fetchTallerTables(taller.id, taller.setupSql)
  },

  loadSchema(taller: Taller): Promise<TallerSchema> {
    return fetchTallerSchema(taller.id, taller.setupSql)
  },

  run(taller: Taller, script: string): Promise<SqlResult> {
    return runTallerScript(taller.id, taller.setupSql, script)
  },

  reset(taller: Taller): Promise<void> {
    return resetTaller(taller.id, taller.setupSql)
  },
}
