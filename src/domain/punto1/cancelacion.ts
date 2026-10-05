import type { Solicitud } from './types'

export const SEMANA_LIMITE = 8
export const ULTIMA_SEMANA = 16

/**
 * Reglamento: se pueden cancelar asignaturas libremente hasta la semana 8,
 * y solo una más después de esa fecha y hasta el último día de clase.
 */
export function puedeCancelar(semana: number, solicitudes: Solicitud[]): { ok: boolean; motivo?: string } {
  if (semana > ULTIMA_SEMANA) return { ok: false, motivo: 'El semestre terminó' }
  if (semana <= SEMANA_LIMITE) return { ok: true }
  const tardias = solicitudes.filter((s) => s.estado === 'cancelada' && (s.semana_cancelacion ?? 0) > SEMANA_LIMITE).length
  return tardias === 0
    ? { ok: true, motivo: 'Después de la semana 8 solo se puede cancelar una asignatura' }
    : { ok: false, motivo: 'Ya cancelaste la única asignatura permitida después de la semana 8' }
}
