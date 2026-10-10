import { Badge } from '@/ui'

/** Texto del botón y advertencia comunes a los dos accesos para reiniciar la BD del punto 1. */
export const REINICIO_LABEL = '↺ Reiniciar base de datos'
export const REINICIO_TITULO = '¿Reiniciar la base de datos?'

export function ReinicioAdvertencia() {
  return (
    <>
      <p>
        <Badge tone="danger">No se puede deshacer</Badge>
      </p>
      <p>
        Se borran <strong>todos los semestres</strong>: historial de notas, estados (prueba, transición, fuera), prematrículas,
        pagos, grupos, evaluaciones y asistencia. Queda solo el periodo 2026-2 en planeación con los datos iniciales.
      </p>
      <p>Si solo quieres seguir con otro semestre, usa «Abrir semestre siguiente» en Calendario (fase de cierre): conserva el historial.</p>
    </>
  )
}
