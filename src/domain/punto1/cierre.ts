import { NOTA_APROBATORIA } from './prematricula'
import type { EstadoEstudiante } from './types'

export interface NotaConCreditos {
  nota_final: number
  creditos: number
}

/** /promedioIntegral = Σ(nota × créditos) / Σ créditos (mismo cálculo que la vista v_estudiante_resumen). */
export function promedioIntegral(notas: NotaConCreditos[]): number {
  const creditos = notas.reduce((s, n) => s + Number(n.creditos), 0)
  if (creditos === 0) return 0
  const suma = notas.reduce((s, n) => s + Number(n.nota_final) * Number(n.creditos), 0)
  return Math.round((suma / creditos) * 100) / 100
}

export const creditosAprobados = (notas: NotaConCreditos[]) =>
  notas.filter((n) => Number(n.nota_final) >= NOTA_APROBATORIA).reduce((s, n) => s + Number(n.creditos), 0)

export interface TransicionEstado {
  estado: EstadoEstudiante
  periodos_en_prueba?: number
  motivo_retiro?: string
  hasta_periodo?: string
  razon: string
}

export const MAX_PERIODOS_EN_PRUEBA = 2

/**
 * Matriz de transición de estados (cierre del semestre):
 * - promedio < 3.0 → prueba (suma un periodo en prueba);
 * - más de 2 periodos en prueba → fuera ("fuera por un semestre", hasta el siguiente periodo);
 * - promedio ≥ 3.0 → normal (también al terminar el semestre de transición).
 * - quien está fuera sigue fuera.
 */
export function siguienteEstado(
  actual: EstadoEstudiante,
  promedio: number,
  periodosEnPrueba: number,
  periodoSiguiente: string,
): TransicionEstado {
  if (actual === 'fuera') return { estado: 'fuera', razon: 'Permanece fuera del programa' }
  if (promedio < NOTA_APROBATORIA) {
    const periodos = (actual === 'prueba' ? periodosEnPrueba : 0) + 1
    if (periodos > MAX_PERIODOS_EN_PRUEBA) {
      return {
        estado: 'fuera',
        motivo_retiro: `Más de ${MAX_PERIODOS_EN_PRUEBA} periodos en prueba académica`,
        hasta_periodo: periodoSiguiente,
        razon: `Promedio ${promedio.toFixed(2)} < 3.0 por ${periodos}.º periodo → fuera por un semestre`,
      }
    }
    return { estado: 'prueba', periodos_en_prueba: periodos, razon: `Promedio ${promedio.toFixed(2)} < 3.0 → prueba (${periodos} periodo${periodos > 1 ? 's' : ''})` }
  }
  return { estado: 'normal', razon: `Promedio ${promedio.toFixed(2)} ≥ 3.0 → normal` }
}

/** "2026-2" → "2027-1". */
export function periodoSiguiente(periodo: string): string {
  const [anio, sem] = periodo.split('-').map(Number)
  return sem === 1 ? `${anio}-2` : `${anio + 1}-1`
}

/**
 * ¿Sigue fuera del programa en `periodo`? «Fuera por un semestre» guarda en `hasta_periodo` el
 * periodo de la sanción: a partir del siguiente puede volver a prematricular. Sin `hasta_periodo`, es definitivo.
 */
export function sigueFuera(estado: string, hastaPeriodo: string | null | undefined, periodo: string): boolean {
  if (estado !== 'fuera') return false
  return !hastaPeriodo || periodo <= hastaPeriodo
}
