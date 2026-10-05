import type { GrupoDetalle } from '@/domain/punto1/types'

export interface GroupPickerProps {
  value?: number
  onChange: (id: number, grupo: GrupoDetalle) => void
}
