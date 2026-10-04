import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { DataError } from './orm/DataError'
import type { ProjectId } from './orm/types'

const LABELS: Record<ProjectId, string> = { p1: 'BD #1 (Punto 1)', p2: 'BD #2 (Punto 2)' }

/** Variables de entorno por proyecto (ver .env.example). Se leen al usarse para poder simularlas en pruebas. */
function env(project: ProjectId): { url?: string; key?: string; label: string } {
  return project === 'p1'
    ? { url: import.meta.env.VITE_P1_SUPABASE_URL, key: import.meta.env.VITE_P1_SUPABASE_ANON_KEY, label: LABELS.p1 }
    : { url: import.meta.env.VITE_P2_SUPABASE_URL, key: import.meta.env.VITE_P2_SUPABASE_ANON_KEY, label: LABELS.p2 }
}

const cache = new Map<ProjectId, SupabaseClient>()

export function isConfigured(project: ProjectId): boolean {
  const { url, key } = env(project)
  return Boolean(url && key)
}

export function projectLabel(project: ProjectId): string {
  return LABELS[project]
}

/** Variables que faltan para un proyecto (para mostrarlas en la UI). */
export function missingEnv(project: ProjectId): string[] {
  const prefix = `VITE_${project.toUpperCase()}_SUPABASE_`
  const { url, key } = env(project)
  return [!url && `${prefix}URL`, !key && `${prefix}ANON_KEY`].filter((v): v is string => Boolean(v))
}

/** Cliente supabase-js del proyecto (creado una sola vez). Lanza DataError si falta configuración. */
export function getClient(project: ProjectId): SupabaseClient {
  const cached = cache.get(project)
  if (cached) return cached
  const { url, key, label } = env(project)
  if (!url || !key) {
    throw new DataError(`Falta configurar ${label}: ${missingEnv(project).join(', ')} en .env.local`, 'not_configured')
  }
  const client = createClient(url, key, { auth: { persistSession: false } })
  cache.set(project, client)
  return client
}

/** Solo para pruebas: inyecta un cliente simulado. */
export function setClientForTesting(project: ProjectId, client: SupabaseClient | null) {
  if (client) cache.set(project, client)
  else cache.delete(project)
}
