import type { PrestamoRow } from '@/domain/punto3/normalizacion'

export interface SourceEditorProps {
  rows: PrestamoRow[]
  edited: boolean
  onChange: (index: number, field: keyof PrestamoRow, value: string) => void
  onReset: () => void
}
