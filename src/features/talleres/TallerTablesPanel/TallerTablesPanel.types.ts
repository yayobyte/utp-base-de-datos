import type { DataError, TallerTable } from '@/data'

export interface TallerTablesPanelProps {
  tables?: TallerTable[]
  loading: boolean
  error?: DataError
  onReload: () => void
}
