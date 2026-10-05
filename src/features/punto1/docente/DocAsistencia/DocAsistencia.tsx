import { useState } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { docenteService } from '@/services/punto1'
import { Chip, DataTable, Input } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { GroupPicker } from '../GroupPicker/GroupPicker'
import styles from './DocAsistencia.module.css'

const hoy = () => new Date().toISOString().slice(0, 10)

/** Asistencia por clase: una marca por estudiante y fecha. */
export function DocAsistencia() {
  const [grupo, setGrupo] = useState<number>()
  const [fecha, setFecha] = useState(hoy)
  const { data, reload } = useAsync(() => (grupo ? docenteService.asistencia(grupo, fecha) : Promise.resolve([])), [grupo, fecha])
  const { run, busy, notice, clearNotice } = useRunner(reload)

  return (
    <ActionShell title="Asistencia" notice={notice} onDismissNotice={clearNotice}>
      <div className={styles.row}>
        <GroupPicker value={grupo} onChange={setGrupo} />
        <Input label="Fecha de la clase" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      {grupo && (
        <DataTable
          compact
          rows={data ?? []}
          emptyMessage="Sin estudiantes en el grupo"
          columns={[
            { key: 'nombre', header: 'Estudiante' },
            {
              key: 'asistio',
              header: 'Asistió',
              render: (e) => (
                <span className={styles.chips}>
                  <Chip selected={e.asistio === true} disabled={busy} onClick={() => void run(() => docenteService.marcarAsistencia(grupo, e.id, fecha, true))}>
                    Sí
                  </Chip>
                  <Chip selected={e.asistio === false} disabled={busy} onClick={() => void run(() => docenteService.marcarAsistencia(grupo, e.id, fecha, false))}>
                    No
                  </Chip>
                </span>
              ),
            },
          ]}
        />
      )}
    </ActionShell>
  )
}
