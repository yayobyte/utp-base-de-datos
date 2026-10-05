/** Tipos del dominio del punto 1 (registro de notas UTP). Sin dependencias de React ni Supabase. */

export type Rol = 'estudiante' | 'docente' | 'administrativo'
export type Fase = 'planeacion' | 'prematricula' | 'pago' | 'asignacion' | 'ajustes' | 'evaluacion' | 'cierre'
export type EstadoEstudiante = 'normal' | 'prueba' | 'transicion' | 'fuera'
export type EstadoSolicitud = 'pendiente' | 'asignada' | 'rechazada' | 'retirada' | 'cancelada'
export type EstadoPago = 'pendiente' | 'pagado' | 'extemporaneo'
export type TipoRequisito = 'prerrequisito' | 'simultaneidad'

export interface Persona {
  id_persona: string
  nombres: string
  apellidos: string
  email: string
  rol: Rol
}

export interface Asignatura {
  cod_asignatura: string
  nombre: string
  creditos: number
  semestre: number
  cupo_maximo_grupo: number
}

export interface Requisito {
  cod_asignatura: string
  cod_requisito: string
  tipo: TipoRequisito
}

export interface HistorialNota {
  id_estudiante: string
  cod_asignatura: string
  periodo: string
  nota_final: number
}

export interface EstudianteResumen {
  id_persona: string
  nombres: string
  apellidos: string
  cod_plan: string
  estado: EstadoEstudiante
  en_bloque: boolean
  promedio_integral: number
  creditos_aprobados: number
  creditos_cursados: number
  periodos_en_prueba: number | null
  plan_anterior: string | null
  motivo_retiro: string | null
  hasta_periodo: string | null
}

export interface Calendario {
  periodo: string
  fase: Fase
  semana_actual: number
  extemporanea: boolean
  aprobado_en: string | null
}

export interface Franja {
  id_franja: number
  dia: string
  hora_inicio: string
  hora_fin: string
}

export interface ProgramacionFranja {
  periodo: string
  cod_asignatura: string
  id_franja: number
  max_grupos: number
}

export interface Matricula {
  periodo: string
  id_estudiante: string
  estado_pago: EstadoPago
  retirado: boolean
}

export interface Grupo {
  id_grupo: number
  periodo: string
  cod_asignatura: string
  num_grupo: number
  id_franja: number
  id_docente: string | null
}

export interface GrupoDetalle extends Grupo {
  asignatura: string
  creditos: number
  cupo: number
  dia: string
  hora_inicio: string
  hora_fin: string
  docente: string | null
  inscritos: number
}

export interface Solicitud {
  id_solicitud: number
  periodo: string
  id_estudiante: string
  cod_asignatura: string
  estado: EstadoSolicitud
  motivo_rechazo: string | null
  id_grupo: number | null
  semana_cancelacion: number | null
}

export interface SolicitudDetalle extends Solicitud {
  estudiante: string
  asignatura: string
  creditos: number
  num_grupo: number | null
  dia: string | null
  hora_inicio: string | null
  hora_fin: string | null
  id_franja: number | null
}

export interface FormaEvaluacion {
  id_evaluacion: number
  id_grupo: number
  descripcion: string
  porcentaje: number
  fecha: string | null
}

export interface RegistroNota {
  id_evaluacion: number
  id_estudiante: string
  valor: number
}

export interface RegistroAsistencia {
  id_grupo: number
  id_estudiante: string
  fecha: string
  asistio: boolean
}

export interface SeguimientoTransicion {
  id_grupo: number
  id_estudiante: string
  nota_comportamiento: number
  nota_dedicacion: number
}
