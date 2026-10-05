import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { puedeCancelar, SEMANA_LIMITE } from '@/domain/punto1/cancelacion'
import { franjaTexto } from '@/domain/punto1/horario'
import { estudianteService } from '@/services/punto1'
import { Badge, Button, DataTable } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'
import styles from './EstCancelacion.module.css'

/** Cancelación de asignaturas: libre hasta la semana 8 y solo una después, hasta el último día de clase. */
export function EstCancelacion() {
  const { persona, calendario } = usePunto1()
  const { data, loading, error, reload } = useAsync(() => estudianteService.horario(persona.id_persona), [persona.id_persona])
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const regla = puedeCancelar(calendario.semana_actual, data ?? [])

  return (
    <ActionShell
      title="Cancelar asignaturas"
      description={`Hasta la semana ${SEMANA_LIMITE} puedes cancelar libremente; después, solo una asignatura hasta el último día de clase.`}
      loading={loading && !data}
      error={error?.message}
      notice={notice}
      onDismissNotice={clearNotice}
    >
      <p className={styles.rule}>
        Semana actual: <Badge tone="outline">{calendario.semana_actual}</Badge>
        <Badge tone={regla.ok ? 'success' : 'danger'}>{regla.ok ? 'Puedes cancelar' : 'No puedes cancelar'}</Badge>
        {regla.motivo && <span>{regla.motivo}</span>}
      </p>
      <DataTable
        compact
        rows={(data ?? []).filter((s) => s.estado === 'asignada' || s.estado === 'cancelada')}
        emptyMessage="No tienes asignaturas matriculadas"
        columns={[
          { key: 'asignatura', header: 'Asignatura', render: (s) => `${s.cod_asignatura} · ${s.asignatura}` },
          { key: 'franja', header: 'Franja', render: (s) => franjaTexto(s) },
          { key: 'estado', header: 'Estado', render: (s) => (s.estado === 'cancelada' ? `Cancelada (semana ${s.semana_cancelacion})` : 'Matriculada') },
          {
            key: 'cancelar',
            header: '',
            render: (s) =>
              s.estado === 'asignada' && (
                <Button size="sm" variant="subtle" disabled={busy || !regla.ok} onClick={() => void run(() => estudianteService.cancelar(persona.id_persona, s.id_solicitud), 'Asignatura cancelada')}>
                  Cancelar
                </Button>
              ),
          },
        ]}
      />
    </ActionShell>
  )
}
