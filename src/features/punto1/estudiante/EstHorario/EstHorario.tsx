import { useAsync } from '@/hooks/useAsync'
import { franjaTexto, ordenarHorario } from '@/domain/punto1/horario'
import { estudianteService } from '@/services/punto1'
import { Badge, DataTable } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'

const TONO = { asignada: 'success', rechazada: 'danger', pendiente: 'neutral', retirada: 'outline', cancelada: 'outline' } as const

/** Horario publicado: grupos asignados y, para cada asignatura no asignada, el motivo. */
export function EstHorario() {
  const { persona, calendario } = usePunto1()
  const { data, loading, error } = useAsync(() => estudianteService.horario(persona.id_persona), [persona.id_persona, calendario.fase])

  return (
    <ActionShell title="Mi horario" description={`Periodo ${calendario.periodo}`} loading={loading && !data} error={error?.message}>
      <DataTable
        rows={ordenarHorario(data ?? [])}
        emptyMessage="Sin asignaturas en este periodo"
        columns={[
          { key: 'asignatura', header: 'Asignatura', render: (s) => `${s.cod_asignatura} · ${s.asignatura}` },
          { key: 'estado', header: 'Estado', render: (s) => <Badge tone={TONO[s.estado]}>{s.estado}</Badge> },
          { key: 'num_grupo', header: 'Grupo', render: (s) => (s.num_grupo ? `G${s.num_grupo}` : '—') },
          { key: 'franja', header: 'Franja', render: (s) => franjaTexto(s) },
          { key: 'motivo_rechazo', header: 'Motivo', render: (s) => s.motivo_rechazo ?? '' },
        ]}
      />
    </ActionShell>
  )
}
