import { DataError, p1 } from '@/data'
import { notaFinal, validarPorcentajes } from '@/domain/punto1/evaluacion'
import type { FormaEvaluacion } from '@/domain/punto1/types'
import { calendarioActual } from './contexto'

export type FormaNueva = Pick<FormaEvaluacion, 'descripcion' | 'porcentaje' | 'fecha'>

/** Casos de uso del Docente. */
export const docenteService = {
  async misGrupos(idDocente: string) {
    const cal = await calendarioActual()
    return p1.grupoDetalle.findBy({ periodo: cal.periodo, id_docente: idDocente }, { orderBy: [{ column: 'cod_asignatura' }, { column: 'num_grupo' }] })
  },

  async formas(id_grupo: number) {
    return p1.forma.findBy({ id_grupo }, { orderBy: { column: 'id_evaluacion' } })
  },

  /** Reemplaza la forma de evaluación del grupo (los porcentajes deben sumar 100). */
  async guardarFormas(id_grupo: number, formas: FormaNueva[]) {
    const error = validarPorcentajes(formas)
    if (error) throw new DataError(error, 'query_failed')
    const previas = await p1.forma.findBy({ id_grupo })
    if (previas.length) {
      const notas = await p1.nota.findIn('id_evaluacion', previas.map((f) => f.id_evaluacion))
      if (notas.length) throw new DataError('Ya hay notas registradas: no se puede cambiar la forma de evaluación', 'query_failed')
      await p1.forma.remove({ id_grupo })
    }
    await p1.forma.insert(formas.map((f) => ({ ...f, id_grupo, fecha: f.fecha || null })))
  },

  /** Estudiantes matriculados en el grupo, con su estado académico. */
  async estudiantes(id_grupo: number) {
    const inscritos = await p1.solicitudDetalle.findBy({ id_grupo, estado: 'asignada' }, { orderBy: { column: 'estudiante' } })
    const resumenes = await p1.resumen.findIn('id_persona', inscritos.map((s) => s.id_estudiante))
    return inscritos.map((s) => ({ id: s.id_estudiante, nombre: s.estudiante, estado: resumenes.find((r) => r.id_persona === s.id_estudiante)?.estado ?? 'normal' }))
  },

  async planilla(id_grupo: number) {
    const [formas, estudiantes] = await Promise.all([this.formas(id_grupo), this.estudiantes(id_grupo)])
    const notas = await p1.nota.findIn('id_evaluacion', formas.map((f) => f.id_evaluacion))
    return {
      formas,
      estudiantes: estudiantes.map((e) => ({ ...e, final: notaFinal(formas, notas, e.id) })),
      notas,
    }
  },

  async guardarNota(id_evaluacion: number, id_estudiante: string, valor: number) {
    const cal = await calendarioActual()
    if (cal.fase !== 'evaluacion') throw new DataError('Las notas se registran en la fase de evaluación', 'query_failed')
    if (valor < 0 || valor > 5) throw new DataError('La nota debe estar entre 0.0 y 5.0', 'query_failed')
    await p1.nota.upsert({ id_evaluacion, id_estudiante, valor }, 'id_evaluacion,id_estudiante')
  },

  async asistencia(id_grupo: number, fecha: string) {
    const [estudiantes, registros] = await Promise.all([this.estudiantes(id_grupo), p1.asistencia.findBy({ id_grupo, fecha })])
    return estudiantes.map((e) => ({ ...e, asistio: registros.find((r) => r.id_estudiante === e.id)?.asistio ?? null }))
  },

  async marcarAsistencia(id_grupo: number, id_estudiante: string, fecha: string, asistio: boolean) {
    await p1.asistencia.upsert({ id_grupo, id_estudiante, fecha, asistio }, 'id_grupo,id_estudiante,fecha')
  },

  /** Solo los estudiantes en semestre de transición llevan notas de comportamiento y dedicación. */
  async seguimiento(id_grupo: number) {
    const [estudiantes, registros] = await Promise.all([this.estudiantes(id_grupo), p1.seguimiento.findBy({ id_grupo })])
    return estudiantes
      .filter((e) => e.estado === 'transicion')
      .map((e) => ({ ...e, registro: registros.find((r) => r.id_estudiante === e.id) }))
  },

  async guardarSeguimiento(id_grupo: number, id_estudiante: string, nota_comportamiento: number, nota_dedicacion: number) {
    const est = await p1.estudiante.getOne({ id_persona: id_estudiante })
    if (est.estado !== 'transicion') throw new DataError('Solo aplica a estudiantes en semestre de transición', 'query_failed')
    for (const v of [nota_comportamiento, nota_dedicacion]) if (v < 0 || v > 5) throw new DataError('Las notas van de 0.0 a 5.0', 'query_failed')
    await p1.seguimiento.upsert({ id_grupo, id_estudiante, nota_comportamiento, nota_dedicacion }, 'id_grupo,id_estudiante')
  },
}
