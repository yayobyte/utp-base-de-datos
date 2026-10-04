import { isConfigured, missingEnv, projectLabel, type ProjectId } from '@/data'

export interface ProjectStatus {
  configured: boolean
  label: string
  missing: string[]
}

/** Estado de configuración de un proyecto Supabase (variables de entorno). */
export function useProjectStatus(project: ProjectId): ProjectStatus {
  return { configured: isConfigured(project), label: projectLabel(project), missing: missingEnv(project) }
}
