import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { adminService } from '@/services/punto1'
import { Badge, Button, DataTable } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'

const TONO = { pendiente: 'warning', pagado: 'success', extemporaneo: 'strong' } as const

/** Validación de pago: a quien no pagó no se le genera horario. */
export function AdminPagos() {
  const { calendario } = usePunto1()
  const { data, loading, error, reload } = useAsync(() => adminService.pagos())
  const { run, busy, notice, clearNotice } = useRunner(reload)

  return (
    <ActionShell
      title="Pagos de matrícula"
      description="Al terminar el periodo de pago se retira a quienes no pagaron: sus solicitudes quedan rechazadas."
      loading={loading && !data}
      error={error?.message}
      notice={notice}
      onDismissNotice={clearNotice}
      actions={
        <Button disabled={busy || calendario.fase !== 'asignacion'} title={calendario.fase !== 'asignacion' ? 'Disponible en la fase de asignación' : undefined} onClick={() => void run(() => adminService.retirarNoPagados(), (n) => `${n} estudiante(s) retirado(s)`)}>
          Retirar no pagados
        </Button>
      }
    >
      <DataTable
        compact
        rows={data ?? []}
        emptyMessage="Nadie ha prematriculado todavía"
        columns={[
          { key: 'id_estudiante', header: 'Código' },
          { key: 'nombre', header: 'Estudiante', render: (m) => (m.estudiante ? `${m.estudiante.nombres} ${m.estudiante.apellidos}` : m.id_estudiante) },
          { key: 'estado_pago', header: 'Pago', render: (m) => <Badge tone={TONO[m.estado_pago]}>{m.estado_pago}</Badge> },
          { key: 'retirado', header: 'Retirado', render: (m) => (m.retirado ? 'Sí' : 'No') },
        ]}
      />
    </ActionShell>
  )
}
