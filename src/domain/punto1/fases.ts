import type { Fase } from './types'

/** Fases del calendario académico, en orden. El Admin las avanza. */
export const FASES: { id: Fase; label: string; descripcion: string }[] = [
  { id: 'planeacion', label: 'Planeación', descripcion: 'Se definen franjas horarias y número máximo de grupos.' },
  { id: 'prematricula', label: 'Prematrícula', descripcion: 'Los estudiantes eligen asignaturas según su plan.' },
  { id: 'pago', label: 'Pago', descripcion: 'Los estudiantes pagan la matrícula.' },
  { id: 'asignacion', label: 'Asignación', descripcion: 'Se retiran los no pagados, se asignan franjas y se forman grupos.' },
  { id: 'ajustes', label: 'Ajustes', descripcion: 'Horario publicado: docentes, ajustes y matrícula extemporánea.' },
  { id: 'evaluacion', label: 'Evaluación', descripcion: 'Docentes evalúan; estudiantes pueden cancelar asignaturas.' },
  { id: 'cierre', label: 'Cierre', descripcion: 'Se calculan promedios, créditos y estados.' },
]

export const faseIndex = (fase: Fase) => FASES.findIndex((f) => f.id === fase)
export const faseLabel = (fase: Fase) => FASES[faseIndex(fase)]?.label ?? fase

export function siguienteFase(fase: Fase): Fase | null {
  return FASES[faseIndex(fase) + 1]?.id ?? null
}

/** La fase actual es igual o posterior a `desde`. */
export const faseAlcanzada = (actual: Fase, desde: Fase) => faseIndex(actual) >= faseIndex(desde)
