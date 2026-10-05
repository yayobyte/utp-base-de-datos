import type { SqlResult } from '@/data'

export interface SqlConsoleProps {
  /** Script actual (controlado por el padre para poder "abrir en la consola"). */
  value: string
  onChange: (value: string) => void
  onRun: (script: string) => Promise<SqlResult>
}
