import { getClient, isConfigured, projectLabel } from './clients'
import { DataError } from './orm/DataError'
import type { ProjectId } from './orm/types'

export interface HealthReport {
  project: ProjectId
  label: string
  configured: boolean
  ok: boolean
  /** Última migración registrada en app.despliegue. */
  version?: string
  migrations?: number
  serverTime?: string
  latencyMs?: number
  error?: string
}

interface HealthResponse {
  ok?: boolean
  version?: string
  migraciones?: number
  hora_servidor?: string
}

/** Llama a la RPC public.health() del proyecto. Nunca lanza: devuelve el problema en `error`. */
export async function checkHealth(project: ProjectId): Promise<HealthReport> {
  const base = { project, label: projectLabel(project), configured: isConfigured(project) }
  if (!base.configured) return { ...base, ok: false, error: 'Faltan variables de entorno' }

  const started = performance.now()
  try {
    const { data, error } = await getClient(project).rpc('health')
    const latencyMs = Math.round(performance.now() - started)
    if (error) throw DataError.from(error)
    const res = (data ?? {}) as HealthResponse
    return {
      ...base,
      ok: res.ok === true,
      version: res.version,
      migrations: res.migraciones,
      serverTime: res.hora_servidor,
      latencyMs,
    }
  } catch (e) {
    return { ...base, ok: false, latencyMs: Math.round(performance.now() - started), error: DataError.from(e).message }
  }
}
