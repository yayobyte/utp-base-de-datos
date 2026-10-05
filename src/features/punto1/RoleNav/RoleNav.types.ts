import type { Calendario, Rol } from '@/domain/punto1/types'

export interface RoleNavProps {
  rol: Rol
  calendario: Calendario
  activeId?: string
  onSelect: (id: string) => void
}
