import type { DataError, SqlResult } from '@/data'

export interface ResultViewProps {
  result?: SqlResult
  error?: DataError
  loading?: boolean
  /** Texto mientras no se ha ejecutado nada. */
  idleMessage?: string
}
