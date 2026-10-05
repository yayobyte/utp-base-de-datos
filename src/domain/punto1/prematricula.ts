import type { Asignatura, HistorialNota, Requisito } from './types'

export const NOTA_APROBATORIA = 3.0

/** Mejor nota obtenida por asignatura (según el historial). */
export function mejoresNotas(historial: HistorialNota[]): Map<string, number> {
  const best = new Map<string, number>()
  for (const h of historial) best.set(h.cod_asignatura, Math.max(best.get(h.cod_asignatura) ?? 0, Number(h.nota_final)))
  return best
}

export const aprobadas = (historial: HistorialNota[]) =>
  new Set([...mejoresNotas(historial)].filter(([, n]) => n >= NOTA_APROBATORIA).map(([c]) => c))

export interface OpcionPrematricula {
  asignatura: Asignatura
  elegible: boolean
  motivo?: string
  /** Simultaneidades que deben inscribirse en el mismo periodo. */
  simultaneas: string[]
}

/**
 * Asignaturas que el estudiante puede tomar según el plan y el reglamento:
 * - del plan de estudios y aún no aprobadas;
 * - todos los prerrequisitos aprobados (nota ≥ 3.0);
 * - simultaneidades: aprobadas o inscritas en el mismo periodo (se valida al enviar).
 */
export function opcionesPrematricula(
  plan: Asignatura[],
  requisitos: Requisito[],
  historial: HistorialNota[],
): OpcionPrematricula[] {
  const ok = aprobadas(historial)
  const notas = mejoresNotas(historial)
  return plan
    .filter((a) => !ok.has(a.cod_asignatura))
    .map((asignatura) => {
      const reqs = requisitos.filter((r) => r.cod_asignatura === asignatura.cod_asignatura)
      const faltantes = reqs.filter((r) => r.tipo === 'prerrequisito' && !ok.has(r.cod_requisito))
      const simultaneas = reqs.filter((r) => r.tipo === 'simultaneidad' && !ok.has(r.cod_requisito)).map((r) => r.cod_requisito)
      if (faltantes.length) {
        const detalle = faltantes
          .map((r) => (notas.has(r.cod_requisito) ? `${r.cod_requisito} (nota ${notas.get(r.cod_requisito)!.toFixed(1)})` : r.cod_requisito))
          .join(', ')
        return { asignatura, elegible: false, motivo: `Prerrequisito sin aprobar: ${detalle}`, simultaneas }
      }
      return { asignatura, elegible: true, simultaneas }
    })
    .sort((a, b) => Number(b.elegible) - Number(a.elegible) || a.asignatura.semestre - b.asignatura.semestre)
}

/** Valida una selección: solo elegibles y con sus simultaneidades incluidas. Devuelve errores (vacío = ok). */
export function validarSeleccion(seleccion: string[], opciones: OpcionPrematricula[]): string[] {
  const errores: string[] = []
  const porCodigo = new Map(opciones.map((o) => [o.asignatura.cod_asignatura, o]))
  for (const cod of seleccion) {
    const o = porCodigo.get(cod)
    if (!o) errores.push(`${cod} no está en el plan o ya fue aprobada`)
    else if (!o.elegible) errores.push(`${cod}: ${o.motivo}`)
    else
      for (const s of o.simultaneas)
        if (!seleccion.includes(s)) errores.push(`${cod} requiere cursar ${s} simultáneamente`)
  }
  return errores
}
