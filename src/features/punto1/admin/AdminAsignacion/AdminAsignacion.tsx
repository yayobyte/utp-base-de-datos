import { useState } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { adminService } from '@/services/punto1'
import { Badge, Button, DataTable } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import styles from './AdminAsignacion.module.css'

const TONO = { asignada: 'success', rechazada: 'danger', pendiente: 'neutral', retirada: 'outline', cancelada: 'outline' } as const

/** Asignación automática de franjas y formación de grupos. */
export function AdminAsignacion() {
  const { data, loading, error, reload } = useAsync(() => adminService.resultadoAsignacion())
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const [orden, setOrden] = useState<string[]>()

  return (
    <ActionShell
      title="Asignación de franjas y grupos"
      description="Prioridad: estudiantes en bloque, luego más créditos aprobados, luego mejor promedio. Sin cruces de horario; los grupos se llenan en orden hasta el cupo."
      loading={loading && !data}
      error={error?.message}
      notice={notice}
      onDismissNotice={clearNotice}
      actions={
        <Button
          disabled={busy || Boolean(data?.grupos.length)}
          onClick={() =>
            void run(
              async () => {
                const r = await adminService.ejecutarAsignacion()
                setOrden(r.orden)
                return r
              },
              (r) => `${r.grupos} grupos creados · ${r.asignadas} asignadas · ${r.rechazadas} rechazadas`,
            )
          }
        >
          Ejecutar asignación
        </Button>
      }
    >
      {orden && (
        <p className={styles.orden}>
          Orden de prioridad: {orden.map((id, i) => <Badge key={id} tone={i === 0 ? 'strong' : 'neutral'}>{`${i + 1}. ${id}`}</Badge>)}
        </p>
      )}
      <h3 className={styles.subtitle}>Grupos</h3>
      <DataTable
        compact
        rows={data?.grupos ?? []}
        emptyMessage="Sin grupos todavía"
        columns={[
          { key: 'asignatura', header: 'Asignatura' },
          { key: 'num_grupo', header: 'Grupo' },
          { key: 'franja', header: 'Franja', render: (g) => `${g.dia} ${g.hora_inicio}–${g.hora_fin}` },
          { key: 'inscritos', header: 'Inscritos', render: (g) => `${g.inscritos}/${g.cupo}` },
        ]}
      />
      <h3 className={styles.subtitle}>Solicitudes</h3>
      <DataTable
        compact
        rows={data?.solicitudes ?? []}
        emptyMessage="Sin solicitudes"
        columns={[
          { key: 'estudiante', header: 'Estudiante' },
          { key: 'asignatura', header: 'Asignatura' },
          { key: 'estado', header: 'Estado', render: (s) => <Badge tone={TONO[s.estado]}>{s.estado}</Badge> },
          { key: 'num_grupo', header: 'Grupo', render: (s) => (s.num_grupo ? `G${s.num_grupo} · ${s.dia} ${s.hora_inicio}` : '—') },
          { key: 'motivo_rechazo', header: 'Motivo', render: (s) => s.motivo_rechazo ?? '' },
        ]}
      />
    </ActionShell>
  )
}
