import { faseLabel } from './fases'
import type { Calendario, Fase, Rol } from './types'

/**
 * Única fuente de verdad de qué puede hacer cada rol y en qué fase.
 * La navegación del punto 1 se construye a partir de esta tabla.
 */
export type AccionId =
  | 'admin-panel'
  | 'admin-calendario'
  | 'admin-programacion'
  | 'admin-pagos'
  | 'admin-asignacion'
  | 'admin-docentes'
  | 'admin-cierre'
  | 'est-resumen'
  | 'est-prematricula'
  | 'est-pago'
  | 'est-horario'
  | 'est-ajustes'
  | 'est-cancelacion'
  | 'doc-evaluacion'
  | 'doc-notas'
  | 'doc-asistencia'
  | 'doc-seguimiento'

export interface Accion {
  id: AccionId
  rol: Rol
  label: string
  descripcion: string
  /** Fases en las que está habilitada; `null` = siempre. */
  fases: Fase[] | null
  /** Condición extra sobre el calendario (p. ej. matrícula extemporánea). */
  extra?: (c: Calendario) => boolean
}

export const ACCIONES: Accion[] = [
  { id: 'admin-panel', rol: 'administrativo', label: 'Panel', descripcion: 'Resumen del periodo', fases: null },
  { id: 'admin-calendario', rol: 'administrativo', label: 'Calendario', descripcion: 'Aprobar y avanzar fases', fases: null },
  { id: 'admin-programacion', rol: 'administrativo', label: 'Franjas y grupos', descripcion: 'Programar asignaturas', fases: ['planeacion'] },
  { id: 'admin-pagos', rol: 'administrativo', label: 'Pagos', descripcion: 'Retirar a quienes no pagaron', fases: ['pago', 'asignacion'] },
  { id: 'admin-asignacion', rol: 'administrativo', label: 'Asignación', descripcion: 'Asignar franjas y crear grupos', fases: ['asignacion'] },
  { id: 'admin-docentes', rol: 'administrativo', label: 'Docentes', descripcion: 'Asignar docentes a grupos', fases: ['ajustes', 'evaluacion'] },
  { id: 'admin-cierre', rol: 'administrativo', label: 'Cierre', descripcion: 'Promedios, créditos y estados', fases: ['cierre'] },

  { id: 'est-resumen', rol: 'estudiante', label: 'Mi resumen', descripcion: 'Promedio, créditos y estado', fases: null },
  { id: 'est-prematricula', rol: 'estudiante', label: 'Prematrícula', descripcion: 'Elegir asignaturas', fases: ['prematricula'] },
  {
    id: 'est-pago',
    rol: 'estudiante',
    label: 'Pagar matrícula',
    descripcion: 'Normal o extemporánea',
    fases: ['pago', 'ajustes'],
    extra: (c) => c.fase === 'pago' || c.extemporanea,
  },
  { id: 'est-horario', rol: 'estudiante', label: 'Mi horario', descripcion: 'Grupos y motivos de rechazo', fases: ['ajustes', 'evaluacion', 'cierre'] },
  { id: 'est-ajustes', rol: 'estudiante', label: 'Ajustes', descripcion: 'Adicionar, cambiar o retirar', fases: ['ajustes'] },
  { id: 'est-cancelacion', rol: 'estudiante', label: 'Cancelar asignaturas', descripcion: 'Hasta la semana 8 y una después', fases: ['evaluacion'] },

  { id: 'doc-evaluacion', rol: 'docente', label: 'Forma de evaluación', descripcion: 'Porcentajes y fechas', fases: ['ajustes', 'evaluacion'] },
  { id: 'doc-notas', rol: 'docente', label: 'Registrar notas', descripcion: 'Notas de 0.0 a 5.0', fases: ['evaluacion'] },
  { id: 'doc-asistencia', rol: 'docente', label: 'Asistencia', descripcion: 'Registro por clase', fases: ['evaluacion'] },
  { id: 'doc-seguimiento', rol: 'docente', label: 'Seguimiento transición', descripcion: 'Comportamiento y dedicación', fases: ['evaluacion'] },
]

export interface Disponibilidad {
  ok: boolean
  motivo?: string
}

export function disponibilidad(accion: Accion, calendario: Calendario): Disponibilidad {
  if (accion.fases && !accion.fases.includes(calendario.fase)) {
    return { ok: false, motivo: `Disponible en: ${accion.fases.map(faseLabel).join(', ')}` }
  }
  if (accion.extra && !accion.extra(calendario)) {
    return { ok: false, motivo: 'Requiere matrícula extemporánea habilitada' }
  }
  return { ok: true }
}

export const accionesDe = (rol: Rol) => ACCIONES.filter((a) => a.rol === rol)
export const accionPorId = (id: string) => ACCIONES.find((a) => a.id === id)
