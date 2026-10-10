import { DataError, p1, p1Rpc } from '@/data'
import { asignar } from '@/domain/punto1/asignacion'
import { periodoSiguiente, siguienteEstado } from '@/domain/punto1/cierre'
import { notaFinal } from '@/domain/punto1/evaluacion'
import { siguienteFase } from '@/domain/punto1/fases'
import type { EstadoEstudiante, Fase, Grupo, ProgramacionFranja } from '@/domain/punto1/types'
import { calendarioActual } from './contexto'

export const MOTIVO_NO_PAGO = 'No pagó la matrícula'

/** Casos de uso del Admin / Registro académico (incluye las tareas del Director de programa). */
export const adminService = {
  async panel() {
    const cal = await calendarioActual()
    const [estudiantes, solicitudes, grupos, matriculas] = await Promise.all([
      p1.resumen.findAll(),
      p1.solicitud.findBy({ periodo: cal.periodo }),
      p1.grupoDetalle.findBy({ periodo: cal.periodo }),
      p1.matricula.findBy({ periodo: cal.periodo }),
    ])
    const porEstado = (e: EstadoEstudiante) => estudiantes.filter((x) => x.estado === e).length
    const porSolicitud = (e: string) => solicitudes.filter((x) => x.estado === e).length
    return {
      calendario: cal,
      estudiantes,
      estados: { normal: porEstado('normal'), prueba: porEstado('prueba'), transicion: porEstado('transicion'), fuera: porEstado('fuera') },
      solicitudes: {
        total: solicitudes.length,
        asignadas: porSolicitud('asignada'),
        rechazadas: porSolicitud('rechazada'),
        pendientes: porSolicitud('pendiente'),
        canceladas: porSolicitud('cancelada'),
      },
      grupos,
      pagos: {
        pagados: matriculas.filter((m) => m.estado_pago !== 'pendiente').length,
        pendientes: matriculas.filter((m) => m.estado_pago === 'pendiente' && !m.retirado).length,
        retirados: matriculas.filter((m) => m.retirado).length,
      },
    }
  },

  // ─── Calendario ──────────────────────────────────────────────────────────
  async avanzarFase(): Promise<Fase> {
    const cal = await calendarioActual()
    const next = siguienteFase(cal.fase)
    if (!next) throw new DataError('El periodo ya está en cierre', 'query_failed')
    if (cal.fase === 'planeacion' && !cal.aprobado_en) {
      throw new DataError('El Consejo Académico debe aprobar el calendario antes de iniciar la prematrícula', 'query_failed')
    }
    await p1.calendario.update({ periodo: cal.periodo }, { fase: next, ...(next === 'evaluacion' ? { semana_actual: 1 } : {}) })
    return next
  },

  /**
   * Abre el siguiente semestre (solo desde «Cierre»). Se conservan historial, estados y planes;
   * programación, prematrículas, grupos y notas son por periodo, así que el nuevo arranca vacío.
   */
  async abrirSiguientePeriodo(): Promise<string> {
    const cal = await calendarioActual()
    if (cal.fase !== 'cierre') throw new DataError('Solo se puede abrir el siguiente semestre desde la fase de cierre', 'query_failed')
    if ((await p1.historial.count({ periodo: cal.periodo })) === 0) {
      throw new DataError(`Primero cierra el semestre ${cal.periodo} (pantalla Cierre): sus notas aún no están en el historial`, 'query_failed')
    }
    const periodo = periodoSiguiente(cal.periodo)
    await p1.calendario.insert([{ periodo, fase: 'planeacion', semana_actual: 1, extemporanea: false }])
    return periodo
  },

  async aprobarCalendario() {
    const cal = await calendarioActual()
    await p1.calendario.update({ periodo: cal.periodo }, { aprobado_en: new Date().toISOString() })
  },

  async fijarSemana(semana: number) {
    if (semana < 1 || semana > 16) throw new DataError('La semana debe estar entre 1 y 16', 'query_failed')
    const cal = await calendarioActual()
    await p1.calendario.update({ periodo: cal.periodo }, { semana_actual: semana })
  },

  async habilitarExtemporanea(valor: boolean) {
    const cal = await calendarioActual()
    await p1.calendario.update({ periodo: cal.periodo }, { extemporanea: valor })
  },

  reiniciarDemo: () => p1Rpc.reiniciarDemo(),

  // ─── Programación de franjas (Director) ──────────────────────────────────
  async programacion() {
    const cal = await calendarioActual()
    const [asignaturas, franjas, programacion] = await Promise.all([
      p1.asignatura.findAll({ orderBy: [{ column: 'semestre' }, { column: 'cod_asignatura' }] }),
      p1.franja.findAll({ orderBy: { column: 'id_franja' } }),
      p1.programacion.findBy({ periodo: cal.periodo }),
    ])
    return { calendario: cal, asignaturas, franjas, programacion }
  },

  async guardarFranja(item: Omit<ProgramacionFranja, 'periodo'>) {
    const cal = await calendarioActual()
    if (item.max_grupos < 1) throw new DataError('El máximo de grupos debe ser al menos 1', 'query_failed')
    await p1.programacion.upsert({ ...item, periodo: cal.periodo }, 'periodo,cod_asignatura,id_franja')
  },

  async quitarFranja(cod_asignatura: string, id_franja: number) {
    const cal = await calendarioActual()
    await p1.programacion.remove({ periodo: cal.periodo, cod_asignatura, id_franja })
  },

  // ─── Pagos ───────────────────────────────────────────────────────────────
  async pagos() {
    const cal = await calendarioActual()
    const [matriculas, estudiantes] = await Promise.all([p1.matricula.findBy({ periodo: cal.periodo }), p1.resumen.findAll()])
    return matriculas.map((m) => ({ ...m, estudiante: estudiantes.find((e) => e.id_persona === m.id_estudiante) }))
  },

  /** Retira a quienes no pagaron: no se les genera horario. */
  async retirarNoPagados(): Promise<number> {
    const cal = await calendarioActual()
    const pendientes = (await p1.matricula.findBy({ periodo: cal.periodo, estado_pago: 'pendiente', retirado: false }))
    for (const m of pendientes) {
      await p1.matricula.update({ periodo: cal.periodo, id_estudiante: m.id_estudiante }, { retirado: true })
      await p1.solicitud.update(
        { periodo: cal.periodo, id_estudiante: m.id_estudiante, estado: 'pendiente' },
        { estado: 'rechazada', motivo_rechazo: MOTIVO_NO_PAGO },
      )
    }
    return pendientes.length
  },

  // ─── Asignación de franjas y grupos ──────────────────────────────────────
  async ejecutarAsignacion() {
    const cal = await calendarioActual()
    const [solicitudes, programacion, asignaturas, matriculas] = await Promise.all([
      p1.solicitud.findBy({ periodo: cal.periodo, estado: 'pendiente' }),
      p1.programacion.findBy({ periodo: cal.periodo }),
      p1.asignatura.findAll(),
      p1.matricula.findBy({ periodo: cal.periodo }),
    ])
    if (solicitudes.length === 0) throw new DataError('No hay solicitudes pendientes por asignar', 'query_failed')
    const ids = [...new Set(solicitudes.map((s) => s.id_estudiante))]
    const estudiantes = await p1.resumen.findIn('id_persona', ids)
    const cupos = new Map(asignaturas.map((a) => [a.cod_asignatura, Number(a.cupo_maximo_grupo)]))
    const excluidos = new Map(
      matriculas.filter((m) => m.retirado || m.estado_pago === 'pendiente').map((m) => [m.id_estudiante, MOTIVO_NO_PAGO]),
    )
    // Grupos ya existentes (ajustes previos) se respetan: la numeración continúa.
    const existentes = await p1.grupo.findBy({ periodo: cal.periodo })
    if (existentes.length) throw new DataError('La asignación ya se ejecutó en este periodo', 'query_failed')

    const plan = asignar(estudiantes, solicitudes, programacion, cupos, excluidos)
    const creados: Grupo[] = plan.grupos.length
      ? await p1.grupo.insert(plan.grupos.map((g) => ({ ...g, periodo: cal.periodo })))
      : []
    const idDe = (cod: string, num: number) => creados.find((g) => g.cod_asignatura === cod && g.num_grupo === num)!.id_grupo

    for (const r of plan.resultados) {
      await p1.solicitud.update(
        { id_solicitud: r.id_solicitud },
        r.asignada
          ? { estado: 'asignada', id_grupo: idDe(r.grupo!.cod_asignatura, r.grupo!.num_grupo), motivo_rechazo: null }
          : { estado: 'rechazada', motivo_rechazo: r.motivo! },
      )
    }
    return {
      orden: plan.orden,
      grupos: creados.length,
      asignadas: plan.resultados.filter((r) => r.asignada).length,
      rechazadas: plan.resultados.filter((r) => !r.asignada).length,
    }
  },

  async resultadoAsignacion() {
    const cal = await calendarioActual()
    const [grupos, solicitudes] = await Promise.all([
      p1.grupoDetalle.findBy({ periodo: cal.periodo }, { orderBy: [{ column: 'cod_asignatura' }, { column: 'num_grupo' }] }),
      p1.solicitudDetalle.findBy({ periodo: cal.periodo }, { orderBy: [{ column: 'id_estudiante' }, { column: 'cod_asignatura' }] }),
    ])
    return { grupos, solicitudes }
  },

  // ─── Docentes (Director) ─────────────────────────────────────────────────
  async docentesYGrupos() {
    const cal = await calendarioActual()
    const [grupos, docentes] = await Promise.all([
      p1.grupoDetalle.findBy({ periodo: cal.periodo }, { orderBy: [{ column: 'cod_asignatura' }, { column: 'num_grupo' }] }),
      p1.persona.findBy({ rol: 'docente' }, { orderBy: { column: 'apellidos' } }),
    ])
    return { grupos, docentes }
  },

  async asignarDocente(id_grupo: number, id_docente: string | null) {
    const cal = await calendarioActual()
    if (id_docente) {
      const grupo = await p1.grupo.getOne({ id_grupo })
      const choque = (await p1.grupo.findBy({ periodo: cal.periodo, id_docente })).find(
        (g) => g.id_grupo !== id_grupo && g.id_franja === grupo.id_franja,
      )
      if (choque) throw new DataError('El docente ya tiene otro grupo en esa franja horaria', 'query_failed')
    }
    await p1.grupo.update({ id_grupo }, { id_docente })
  },

  // ─── Cierre del semestre ─────────────────────────────────────────────────
  async cerrarSemestre() {
    const cal = await calendarioActual()
    const asignadas = await p1.solicitud.findBy({ periodo: cal.periodo, estado: 'asignada' })
    if (asignadas.length === 0) throw new DataError('No hay asignaturas matriculadas para cerrar', 'query_failed')
    const gruposIds = [...new Set(asignadas.map((s) => s.id_grupo!))]
    const formas = await p1.forma.findIn('id_grupo', gruposIds)
    const notas = await p1.nota.findIn('id_evaluacion', formas.map((f) => f.id_evaluacion))

    // 1) Nota final de cada asignatura al historial (base del promedio integral)
    await p1.historial.upsert(
      asignadas.map((s) => ({
        id_estudiante: s.id_estudiante,
        cod_asignatura: s.cod_asignatura,
        periodo: cal.periodo,
        nota_final: notaFinal(formas.filter((f) => f.id_grupo === s.id_grupo), notas, s.id_estudiante),
      })),
      'id_estudiante,cod_asignatura,periodo',
    )

    // 2) Atributos derivados recalculados (vista) y matriz de transición de estados
    const ids = [...new Set(asignadas.map((s) => s.id_estudiante))]
    const resumenes = await p1.resumen.findIn('id_persona', ids)
    const cambios = []
    for (const r of resumenes) {
      const t = siguienteEstado(r.estado, Number(r.promedio_integral), Number(r.periodos_en_prueba ?? 0), periodoSiguiente(cal.periodo))
      await p1Rpc.cambiarEstado({
        p_id_estudiante: r.id_persona,
        p_estado: t.estado,
        p_periodos_en_prueba: t.periodos_en_prueba,
        p_plan_anterior: r.plan_anterior ?? undefined,
        p_motivo_retiro: t.motivo_retiro ?? r.motivo_retiro ?? undefined,
        p_hasta_periodo: t.hasta_periodo ?? r.hasta_periodo ?? undefined,
      })
      cambios.push({
        id: r.id_persona,
        nombre: `${r.nombres} ${r.apellidos}`,
        antes: r.estado,
        despues: t.estado,
        promedio: Number(r.promedio_integral),
        creditos: Number(r.creditos_aprobados),
        razon: t.razon,
      })
    }
    return cambios
  },
}
