import { useAsync } from '@/hooks/useAsync'
import { adminService } from '@/services/punto1'
import { DataTable, Stat } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'
import styles from './AdminPanel.module.css'

/** Resumen del periodo: estados de los estudiantes, solicitudes, pagos y grupos. */
export function AdminPanel() {
  const { calendario } = usePunto1()
  const { data, loading, error } = useAsync(() => adminService.panel(), [calendario.fase, calendario.semana_actual])

  return (
    <ActionShell title="Panel del periodo" description={`Periodo ${calendario.periodo}`} loading={loading && !data} error={error?.message}>
      {data && (
        <>
          <div className={styles.stats}>
            <Stat label="Normal" value={data.estados.normal} />
            <Stat label="Prueba" value={data.estados.prueba} />
            <Stat label="Transición" value={data.estados.transicion} />
            <Stat label="Fuera" value={data.estados.fuera} />
          </div>
          <div className={styles.stats}>
            <Stat label="Solicitudes" value={data.solicitudes.total} helper={`${data.solicitudes.pendientes} pendientes`} />
            <Stat label="Asignadas" value={data.solicitudes.asignadas} />
            <Stat label="Rechazadas" value={data.solicitudes.rechazadas} />
            <Stat label="Pagos" value={data.pagos.pagados} helper={`${data.pagos.pendientes} pendientes · ${data.pagos.retirados} retirados`} />
          </div>
          <h3 className={styles.subtitle}>Estudiantes</h3>
          <DataTable
            compact
            rows={data.estudiantes}
            columns={[
              { key: 'id_persona', header: 'Código' },
              { key: 'nombre', header: 'Nombre', render: (r) => `${r.nombres} ${r.apellidos}` },
              { key: 'estado', header: 'Estado' },
              { key: 'en_bloque', header: 'En bloque', render: (r) => (r.en_bloque ? 'Sí' : 'No') },
              { key: 'creditos_aprobados', header: 'Créditos', align: 'right' },
              { key: 'promedio_integral', header: 'Promedio', align: 'right', render: (r) => Number(r.promedio_integral).toFixed(2) },
            ]}
          />
          <h3 className={styles.subtitle}>Grupos</h3>
          <DataTable
            compact
            rows={data.grupos}
            emptyMessage="Aún no hay grupos: se crean en la fase de asignación"
            columns={[
              { key: 'asignatura', header: 'Asignatura' },
              { key: 'num_grupo', header: 'Grupo' },
              { key: 'franja', header: 'Franja', render: (g) => `${g.dia} ${g.hora_inicio}–${g.hora_fin}` },
              { key: 'docente', header: 'Docente', render: (g) => g.docente ?? 'Sin asignar' },
              { key: 'inscritos', header: 'Inscritos', render: (g) => `${g.inscritos}/${g.cupo}` },
            ]}
          />
        </>
      )}
    </ActionShell>
  )
}
