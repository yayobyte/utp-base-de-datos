import { Repository } from '../orm/Repository'
import { callRpc } from '../rpc'
import type {
  Asignatura,
  Calendario,
  EstadoEstudiante,
  EstudianteResumen,
  FormaEvaluacion,
  Franja,
  Grupo,
  GrupoDetalle,
  HistorialNota,
  Matricula,
  Persona,
  ProgramacionFranja,
  RegistroAsistencia,
  RegistroNota,
  Requisito,
  SeguimientoTransicion,
  Solicitud,
  SolicitudDetalle,
} from '@/domain/punto1/types'

/** Repositorios del punto 1 (BD #1). Una entrada por tabla o vista. */
export const p1 = {
  persona: new Repository<Persona & Record<string, unknown>>('p1', 'persona'),
  docente: new Repository<{ id_persona: string; titulo: string }>('p1', 'docente'),
  estudiante: new Repository<{ id_persona: string; cod_plan: string; estado: EstadoEstudiante; en_bloque: boolean }>('p1', 'estudiante'),
  resumen: new Repository<EstudianteResumen & Record<string, unknown>>('p1', 'v_estudiante_resumen'),
  asignatura: new Repository<Asignatura & Record<string, unknown>>('p1', 'asignatura'),
  planAsignatura: new Repository<{ cod_plan: string; cod_asignatura: string }>('p1', 'plan_asignatura'),
  requisito: new Repository<Requisito & Record<string, unknown>>('p1', 'requisito_asignatura'),
  historial: new Repository<HistorialNota & Record<string, unknown>>('p1', 'historial_nota'),
  calendario: new Repository<Calendario & Record<string, unknown>>('p1', 'calendario_academico'),
  franja: new Repository<Franja & Record<string, unknown>>('p1', 'franja_horaria'),
  programacion: new Repository<ProgramacionFranja & Record<string, unknown>>('p1', 'programacion_franja'),
  matricula: new Repository<Matricula & Record<string, unknown>>('p1', 'matricula_estudiante'),
  grupo: new Repository<Grupo & Record<string, unknown>>('p1', 'grupo'),
  grupoDetalle: new Repository<GrupoDetalle & Record<string, unknown>>('p1', 'v_grupo_detalle'),
  solicitud: new Repository<Solicitud & Record<string, unknown>>('p1', 'solicitud_prematricula'),
  solicitudDetalle: new Repository<SolicitudDetalle & Record<string, unknown>>('p1', 'v_solicitud_detalle'),
  forma: new Repository<FormaEvaluacion & Record<string, unknown>>('p1', 'forma_evaluacion'),
  nota: new Repository<RegistroNota & Record<string, unknown>>('p1', 'registro_nota'),
  asistencia: new Repository<RegistroAsistencia & Record<string, unknown>>('p1', 'registro_asistencia'),
  seguimiento: new Repository<SeguimientoTransicion & Record<string, unknown>>('p1', 'seguimiento_transicion'),
}

export interface CambioEstado {
  p_id_estudiante: string
  p_estado: EstadoEstudiante
  p_periodos_en_prueba?: number
  p_plan_anterior?: string
  p_motivo_retiro?: string
  p_hasta_periodo?: string
}

/** Funciones de la BD #1. */
export const p1Rpc = {
  /** Restaura el escenario de demostración completo. */
  reiniciarDemo: () => callRpc('p1', 'reiniciar_demo'),
  /** Cambia la subclase del estudiante de forma atómica. */
  cambiarEstado: (c: CambioEstado) => callRpc('p1', 'cambiar_estado', { ...c }),
}
