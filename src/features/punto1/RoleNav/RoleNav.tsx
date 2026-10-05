import { accionesDe, disponibilidad } from '@/domain/punto1/permisos'
import { Badge, SideNav } from '@/ui'
import type { RoleNavProps } from './RoleNav.types'

const TITULOS = { administrativo: 'Admin / Registro académico', docente: 'Docente', estudiante: 'Estudiante' } as const

/** Navegación propia del punto 1: acciones del rol, habilitadas según la fase del calendario. */
export function RoleNav({ rol, calendario, activeId, onSelect }: RoleNavProps) {
  const items = accionesDe(rol).map((a) => {
    const d = disponibilidad(a, calendario)
    return {
      id: a.id,
      label: a.label,
      description: a.descripcion,
      disabled: !d.ok,
      disabledReason: d.motivo,
      badge: d.ok && a.fases ? <Badge tone="strong">Ahora</Badge> : undefined,
    }
  })
  return <SideNav ariaLabel={`Acciones de ${TITULOS[rol]}`} sections={[{ title: TITULOS[rol], items }]} activeId={activeId} onSelect={onSelect} />
}
