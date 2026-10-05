import type { EstudianteResumen, ProgramacionFranja, Solicitud } from './types'

/** Orden de prioridad: en bloque primero, luego más créditos aprobados, luego mejor promedio. */
export function ordenarPorPrioridad(estudiantes: EstudianteResumen[]): EstudianteResumen[] {
  return [...estudiantes].sort(
    (a, b) =>
      Number(b.en_bloque) - Number(a.en_bloque) ||
      Number(b.creditos_aprobados) - Number(a.creditos_aprobados) ||
      Number(b.promedio_integral) - Number(a.promedio_integral) ||
      a.id_persona.localeCompare(b.id_persona),
  )
}

export interface GrupoPlan {
  cod_asignatura: string
  num_grupo: number
  id_franja: number
}

export interface ResultadoSolicitud {
  id_solicitud: number
  asignada: boolean
  /** Grupo asignado (clave: asignatura + número). */
  grupo?: GrupoPlan
  motivo?: string
}

export interface ResultadoAsignacion {
  grupos: GrupoPlan[]
  resultados: ResultadoSolicitud[]
  orden: string[]
}

/**
 * Asigna franjas y forma grupos.
 * - Recorre a los estudiantes por prioridad y, para cada asignatura que pidieron, busca la primera franja
 *   programada sin cruce con lo ya asignado y con cupo (max_grupos × cupo de la asignatura).
 * - Los grupos se llenan en orden: el grupo 1 hasta el cupo, luego el 2, y así sucesivamente.
 * - Cada solicitud no asignada lleva su motivo.
 */
export function asignar(
  estudiantes: EstudianteResumen[],
  solicitudes: Solicitud[],
  programacion: ProgramacionFranja[],
  cupos: Map<string, number>,
  excluidos: Map<string, string> = new Map(),
): ResultadoAsignacion {
  const orden = ordenarPorPrioridad(estudiantes)
  const grupos: GrupoPlan[] = []
  const ocupacion = new Map<string, number>() // `${asig}#${num}` → inscritos
  const franjasDe = new Map<string, Set<number>>() // estudiante → franjas ocupadas
  const resultados: ResultadoSolicitud[] = []

  const grupoKey = (g: GrupoPlan) => `${g.cod_asignatura}#${g.num_grupo}`

  for (const est of orden) {
    const propias = solicitudes
      .filter((s) => s.id_estudiante === est.id_persona && s.estado === 'pendiente')
      .sort((a, b) => a.cod_asignatura.localeCompare(b.cod_asignatura))
    const ocupadas = franjasDe.get(est.id_persona) ?? new Set<number>()
    franjasDe.set(est.id_persona, ocupadas)

    for (const sol of propias) {
      const excluido = excluidos.get(est.id_persona)
      if (excluido) {
        resultados.push({ id_solicitud: sol.id_solicitud, asignada: false, motivo: excluido })
        continue
      }
      const cupo = cupos.get(sol.cod_asignatura) ?? 0
      const franjas = programacion.filter((p) => p.cod_asignatura === sol.cod_asignatura)
      if (franjas.length === 0) {
        resultados.push({ id_solicitud: sol.id_solicitud, asignada: false, motivo: 'La asignatura no fue programada este periodo' })
        continue
      }

      let asignado: GrupoPlan | undefined
      let hayCupoConCruce = false
      for (const f of franjas) {
        const enFranja = grupos.filter((g) => g.cod_asignatura === sol.cod_asignatura && g.id_franja === f.id_franja)
        const libre = enFranja.find((g) => (ocupacion.get(grupoKey(g)) ?? 0) < cupo)
        const puedeAbrir = enFranja.length < f.max_grupos
        if (!libre && !puedeAbrir) continue
        if (ocupadas.has(f.id_franja)) {
          hayCupoConCruce = true
          continue
        }
        if (libre) asignado = libre
        else {
          asignado = {
            cod_asignatura: sol.cod_asignatura,
            num_grupo: grupos.filter((g) => g.cod_asignatura === sol.cod_asignatura).length + 1,
            id_franja: f.id_franja,
          }
          grupos.push(asignado)
        }
        break
      }

      if (asignado) {
        ocupacion.set(grupoKey(asignado), (ocupacion.get(grupoKey(asignado)) ?? 0) + 1)
        ocupadas.add(asignado.id_franja)
        resultados.push({ id_solicitud: sol.id_solicitud, asignada: true, grupo: asignado })
      } else {
        resultados.push({
          id_solicitud: sol.id_solicitud,
          asignada: false,
          motivo: hayCupoConCruce ? 'Cruce de horario con otra asignatura asignada' : 'Sin cupo en las franjas programadas',
        })
      }
    }
  }
  return { grupos, resultados, orden: orden.map((e) => e.id_persona) }
}
