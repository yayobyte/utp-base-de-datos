import type { DataError, Punto2Tables } from '@/data'

export interface TablesPanelProps {
  tables?: Punto2Tables
  loading: boolean
  error?: DataError
  onReload: () => void
}
