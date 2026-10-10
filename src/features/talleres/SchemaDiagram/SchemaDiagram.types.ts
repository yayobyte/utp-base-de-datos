import type { TallerSchema } from '@/data'

export interface SchemaDiagramProps {
  schema?: TallerSchema
  loading?: boolean
  /** Cambia para volver a calcular el layout (botón «Reorganizar»). */
  layoutKey?: number
}
