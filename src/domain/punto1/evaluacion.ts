import type { FormaEvaluacion, RegistroNota } from './types'

/** Valida una nota tal como la escribe el docente (máscara 0.0 – 5.0, un decimal). */
export function parseNota(texto: string): { ok: true; valor: number } | { ok: false; error: string } {
  const t = texto.trim().replace(',', '.')
  if (!/^\d(\.\d)?$/.test(t)) return { ok: false, error: 'Formato: un dígito y un decimal (p. ej. 3.5)' }
  const valor = Number(t)
  if (valor < 0 || valor > 5) return { ok: false, error: 'La nota debe estar entre 0.0 y 5.0' }
  return { ok: true, valor }
}

/** Los porcentajes de la forma de evaluación deben sumar exactamente 100. */
export function validarPorcentajes(formas: Pick<FormaEvaluacion, 'porcentaje'>[]): string | null {
  const total = formas.reduce((s, f) => s + Number(f.porcentaje), 0)
  if (formas.length === 0) return 'Define al menos un componente de evaluación'
  if (total !== 100) return `Los porcentajes suman ${total} %; deben sumar 100 %`
  return null
}

/** Nota final del estudiante en un grupo: Σ(nota × porcentaje). Componentes sin nota cuentan 0. */
export function notaFinal(formas: FormaEvaluacion[], notas: RegistroNota[], idEstudiante: string): number {
  const total = formas.reduce((s, f) => {
    const n = notas.find((r) => r.id_evaluacion === f.id_evaluacion && r.id_estudiante === idEstudiante)
    return s + (n ? Number(n.valor) : 0) * (Number(f.porcentaje) / 100)
  }, 0)
  return Math.round(total * 100) / 100
}
