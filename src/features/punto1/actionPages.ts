import type { ComponentType } from 'react'
import type { AccionId } from '@/domain/punto1/permisos'
import { AdminAsignacion } from './admin/AdminAsignacion/AdminAsignacion'
import { AdminCalendario } from './admin/AdminCalendario/AdminCalendario'
import { AdminCierre } from './admin/AdminCierre/AdminCierre'
import { AdminDocentes } from './admin/AdminDocentes/AdminDocentes'
import { AdminPagos } from './admin/AdminPagos/AdminPagos'
import { AdminPanel } from './admin/AdminPanel/AdminPanel'
import { AdminProgramacion } from './admin/AdminProgramacion/AdminProgramacion'
import { DocAsistencia } from './docente/DocAsistencia/DocAsistencia'
import { DocEvaluacion } from './docente/DocEvaluacion/DocEvaluacion'
import { DocNotas } from './docente/DocNotas/DocNotas'
import { DocSeguimiento } from './docente/DocSeguimiento/DocSeguimiento'
import { EstAjustes } from './estudiante/EstAjustes/EstAjustes'
import { EstCancelacion } from './estudiante/EstCancelacion/EstCancelacion'
import { EstHorario } from './estudiante/EstHorario/EstHorario'
import { EstPago } from './estudiante/EstPago/EstPago'
import { EstPrematricula } from './estudiante/EstPrematricula/EstPrematricula'
import { EstResumen } from './estudiante/EstResumen/EstResumen'

/** Página de cada acción (la tabla de acciones vive en domain/punto1/permisos.ts). */
export const ACTION_PAGES: Record<AccionId, ComponentType> = {
  'admin-panel': AdminPanel,
  'admin-calendario': AdminCalendario,
  'admin-programacion': AdminProgramacion,
  'admin-pagos': AdminPagos,
  'admin-asignacion': AdminAsignacion,
  'admin-docentes': AdminDocentes,
  'admin-cierre': AdminCierre,
  'est-resumen': EstResumen,
  'est-prematricula': EstPrematricula,
  'est-pago': EstPago,
  'est-horario': EstHorario,
  'est-ajustes': EstAjustes,
  'est-cancelacion': EstCancelacion,
  'doc-evaluacion': DocEvaluacion,
  'doc-notas': DocNotas,
  'doc-asistencia': DocAsistencia,
  'doc-seguimiento': DocSeguimiento,
}
