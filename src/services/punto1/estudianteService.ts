import { DataError, p1 } from '@/data'
import { puedeCancelar } from '@/domain/punto1/cancelacion'
import { opcionesPrematricula, validarSeleccion } from '@/domain/punto1/prematricula'
import type { GrupoDetalle } from '@/domain/punto1/types'
import { calendarioActual } from './contexto'

/** Casos de uso del Estudiante. */
export const estudianteService = {
  async resumen(id: string) {
    const [resumen, historial, asignaturas] = await Promise.all([
      p1.resumen.getOne({ id_persona: id }),
      p1.historial.findBy({ id_estudiante: id }, { orderBy: [{ column: 'periodo' }, { column: 'cod_asignatura' }] }),
      p1.asignatura.findAll(),
    ])
    return {
      resumen,
      historial: historial.map((h) => ({ ...h, asignatura: asignaturas.find((a) => a.cod_asignatura === h.cod_asignatura) })),
    }
  },

  async prematricula(id: string) {
    const cal = await calendarioActual()
    const est = await p1.estudiante.getOne({ id_persona: id })
    const [planAsig, asignaturas, requisitos, historial, actuales, programacion] = await Promise.all([
      p1.planAsignatura.findBy({ cod_plan: est.cod_plan }),
      p1.asignatura.findAll({ orderBy: { column: 'semestre' } }),
      p1.requisito.findAll(),
      p1.historial.findBy({ id_estudiante: id }),
      p1.solicitud.findBy({ periodo: cal.periodo, id_estudiante: id }),
      p1.programacion.findBy({ periodo: cal.periodo }),
    ])
    const plan = asignaturas.filter((a) => planAsig.some((p) => p.cod_asignatura === a.cod_asignatura))
    const programadas = new Set(programacion.map((p) => p.cod_asignatura))
    return {
      estado: est.estado,
      opciones: opcionesPrematricula(plan, requisitos, historial).map((o) => ({ ...o, programada: programadas.has(o.asignatura.cod_asignatura) })),
      seleccion: actuales.map((s) => s.cod_asignatura),
    }
  },

  async enviarPrematricula(id: string, seleccion: string[]) {
    const cal = await calendarioActual()
    if (cal.fase !== 'prematricula') throw new DataError('La prematrícula no está abierta', 'query_failed')
    const { estado, opciones } = await this.prematricula(id)
    if (estado === 'fuera') throw new DataError('Un estudiante fuera del programa no puede prematricular', 'query_failed')
    const errores = validarSeleccion(seleccion, opciones)
    if (errores.length) throw new DataError(errores.join(' · '), 'query_failed')
    await p1.solicitud.remove({ periodo: cal.periodo, id_estudiante: id })
    if (seleccion.length) {
      await p1.solicitud.insert(seleccion.map((cod) => ({ periodo: cal.periodo, id_estudiante: id, cod_asignatura: cod })))
      await p1.matricula.upsert({ periodo: cal.periodo, id_estudiante: id }, 'periodo,id_estudiante')
    } else {
      await p1.matricula.remove({ periodo: cal.periodo, id_estudiante: id })
    }
  },

  async matricula(id: string) {
    const cal = await calendarioActual()
    const [matricula, solicitudes, asignaturas] = await Promise.all([
      p1.matricula.findOne({ periodo: cal.periodo, id_estudiante: id }),
      p1.solicitud.findBy({ periodo: cal.periodo, id_estudiante: id }),
      p1.asignatura.findAll(),
    ])
    const creditos = solicitudes.reduce((s, x) => s + Number(asignaturas.find((a) => a.cod_asignatura === x.cod_asignatura)?.creditos ?? 0), 0)
    return { calendario: cal, matricula, creditos, valor: creditos * 180_000 }
  },

  async pagar(id: string) {
    const cal = await calendarioActual()
    const m = await p1.matricula.findOne({ periodo: cal.periodo, id_estudiante: id })
    if (!m) throw new DataError('No tienes prematrícula en este periodo', 'not_found')
    if (m.estado_pago !== 'pendiente') throw new DataError('La matrícula ya está pagada', 'query_failed')
    const extemporaneo = cal.fase !== 'pago'
    if (extemporaneo && !cal.extemporanea) throw new DataError('El periodo de pago terminó', 'query_failed')
    await p1.matricula.update({ periodo: cal.periodo, id_estudiante: id }, { estado_pago: extemporaneo ? 'extemporaneo' : 'pagado', retirado: false })
  },

  async horario(id: string) {
    const cal = await calendarioActual()
    return p1.solicitudDetalle.findBy({ periodo: cal.periodo, id_estudiante: id }, { orderBy: { column: 'cod_asignatura' } })
  },

  /** Grupos con cupo a los que el estudiante puede ir sin cruce (para ajustes). */
  async opcionesAjuste(id: string) {
    const cal = await calendarioActual()
    const [mias, grupos] = await Promise.all([
      p1.solicitudDetalle.findBy({ periodo: cal.periodo, id_estudiante: id }),
      p1.grupoDetalle.findBy({ periodo: cal.periodo }, { orderBy: [{ column: 'cod_asignatura' }, { column: 'num_grupo' }] }),
    ])
    const ocupadas = new Set(mias.filter((s) => s.estado === 'asignada').map((s) => s.id_franja))
    const disponible = (g: GrupoDetalle, ignorarFranja?: number | null) =>
      Number(g.inscritos) < Number(g.cupo) && (!ocupadas.has(g.id_franja) || g.id_franja === ignorarFranja)
    return { mias, grupos, disponible }
  },

  async adicionar(id: string, id_grupo: number) {
    const cal = await calendarioActual()
    const m = await p1.matricula.findOne({ periodo: cal.periodo, id_estudiante: id })
    if (!m || m.retirado) throw new DataError('Debes tener la matrícula pagada para hacer ajustes', 'query_failed')
    const { mias, grupos, disponible } = await this.opcionesAjuste(id)
    const g = grupos.find((x) => x.id_grupo === id_grupo)
    if (!g) throw new DataError('El grupo no existe', 'not_found')
    if (!disponible(g)) throw new DataError('El grupo no tiene cupo o se cruza con tu horario', 'query_failed')
    const { opciones } = await this.prematricula(id)
    const op = opciones.find((o) => o.asignatura.cod_asignatura === g.cod_asignatura)
    if (!op?.elegible) throw new DataError(op?.motivo ?? 'La asignatura no está en tu plan', 'query_failed')
    const previa = mias.find((s) => s.cod_asignatura === g.cod_asignatura)
    if (previa && previa.estado === 'asignada') throw new DataError('Ya tienes esa asignatura; usa «Cambiar de grupo»', 'query_failed')
    if (previa) await p1.solicitud.update({ id_solicitud: previa.id_solicitud }, { estado: 'asignada', id_grupo, motivo_rechazo: null })
    else await p1.solicitud.insert({ periodo: cal.periodo, id_estudiante: id, cod_asignatura: g.cod_asignatura, estado: 'asignada', id_grupo })
  },

  async cambiarGrupo(id: string, id_solicitud: number, id_grupo: number) {
    const { mias, grupos, disponible } = await this.opcionesAjuste(id)
    const s = mias.find((x) => x.id_solicitud === id_solicitud && x.estado === 'asignada')
    const g = grupos.find((x) => x.id_grupo === id_grupo)
    if (!s || !g || g.cod_asignatura !== s.cod_asignatura) throw new DataError('Cambio de grupo inválido', 'query_failed')
    if (!disponible(g, s.id_franja)) throw new DataError('El grupo no tiene cupo o se cruza con tu horario', 'query_failed')
    await p1.solicitud.update({ id_solicitud }, { id_grupo })
  },

  async retirar(id: string, id_solicitud: number) {
    const s = await p1.solicitud.getOne({ id_solicitud })
    if (s.id_estudiante !== id) throw new DataError('La asignatura no es tuya', 'query_failed')
    await p1.solicitud.update({ id_solicitud }, { estado: 'retirada', id_grupo: null })
  },

  async cancelar(id: string, id_solicitud: number) {
    const cal = await calendarioActual()
    const mias = await p1.solicitud.findBy({ periodo: cal.periodo, id_estudiante: id })
    const s = mias.find((x) => x.id_solicitud === id_solicitud)
    if (!s || s.estado !== 'asignada') throw new DataError('Solo se pueden cancelar asignaturas matriculadas', 'query_failed')
    const regla = puedeCancelar(cal.semana_actual, mias)
    if (!regla.ok) throw new DataError(regla.motivo!, 'query_failed')
    await p1.solicitud.update({ id_solicitud }, { estado: 'cancelada', id_grupo: null, semana_cancelacion: cal.semana_actual })
  },
}
