import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { adminService } from '@/services/punto1'
import { DataTable, Select } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'

/** Director de programa: define el docente de cada grupo (sin cruces de horario para el docente). */
export function AdminDocentes() {
  const { data, loading, error, reload } = useAsync(() => adminService.docentesYGrupos())
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const opciones = (data?.docentes ?? []).map((d) => ({ value: d.id_persona, label: `${d.nombres} ${d.apellidos}` }))

  return (
    <ActionShell
      title="Docentes por grupo"
      description="Con el horario publicado, el director asigna quién dicta cada grupo."
      loading={loading && !data}
      error={error?.message}
      notice={notice}
      onDismissNotice={clearNotice}
    >
      <DataTable
        compact
        rows={data?.grupos ?? []}
        emptyMessage="No hay grupos: primero ejecuta la asignación"
        columns={[
          { key: 'asignatura', header: 'Asignatura' },
          { key: 'num_grupo', header: 'Grupo' },
          { key: 'franja', header: 'Franja', render: (g) => `${g.dia} ${g.hora_inicio}–${g.hora_fin}` },
          { key: 'inscritos', header: 'Inscritos', render: (g) => `${g.inscritos}/${g.cupo}` },
          {
            key: 'docente',
            header: 'Docente',
            render: (g) => (
              <Select
                aria-label={`Docente de ${g.asignatura} grupo ${g.num_grupo}`}
                placeholder="Sin asignar"
                disabled={busy}
                value={g.id_docente ?? ''}
                options={opciones}
                onChange={(e) => void run(() => adminService.asignarDocente(g.id_grupo, e.target.value || null), 'Docente asignado')}
              />
            ),
          },
        ]}
      />
    </ActionShell>
  )
}
