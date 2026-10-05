import { useState } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { adminService } from '@/services/punto1'
import { Button, DataTable, Input, Select } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import styles from './AdminProgramacion.module.css'

/** Director de programa: franjas horarias por asignatura y número máximo de grupos por franja. */
export function AdminProgramacion() {
  const { data, loading, error, reload } = useAsync(() => adminService.programacion())
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const [asig, setAsig] = useState('')
  const [franja, setFranja] = useState('')
  const [max, setMax] = useState('1')

  const franjaTxt = (id: number) => {
    const f = data?.franjas.find((x) => x.id_franja === id)
    return f ? `${f.dia} ${f.hora_inicio.slice(0, 5)}–${f.hora_fin.slice(0, 5)}` : id
  }
  const nombre = (cod: string) => data?.asignaturas.find((a) => a.cod_asignatura === cod)?.nombre ?? cod

  return (
    <ActionShell
      title="Franjas y grupos"
      description="Antes de la prematrícula se define en qué franjas se dicta cada asignatura y cuántos grupos caben en cada una."
      loading={loading && !data}
      error={error?.message}
      notice={notice}
      onDismissNotice={clearNotice}
    >
      {data && (
        <>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault()
              void run(() => adminService.guardarFranja({ cod_asignatura: asig, id_franja: Number(franja), max_grupos: Number(max) }), 'Franja guardada')
            }}
          >
            <Select
              label="Asignatura"
              placeholder="Selecciona…"
              value={asig}
              onChange={(e) => setAsig(e.target.value)}
              options={data.asignaturas.map((a) => ({ value: a.cod_asignatura, label: `${a.cod_asignatura} · ${a.nombre} (cupo ${a.cupo_maximo_grupo})` }))}
            />
            <Select
              label="Franja"
              placeholder="Selecciona…"
              value={franja}
              onChange={(e) => setFranja(e.target.value)}
              options={data.franjas.map((f) => ({ value: String(f.id_franja), label: franjaTxt(f.id_franja) as string }))}
            />
            <Input label="Máx. grupos" type="number" min={1} max={9} value={max} onChange={(e) => setMax(e.target.value)} />
            <Button type="submit" disabled={busy || !asig || !franja}>
              Guardar
            </Button>
          </form>
          <DataTable
            compact
            rows={data.programacion}
            emptyMessage="Sin franjas programadas"
            columns={[
              { key: 'cod_asignatura', header: 'Asignatura', render: (p) => `${p.cod_asignatura} · ${nombre(p.cod_asignatura)}` },
              { key: 'id_franja', header: 'Franja', render: (p) => franjaTxt(p.id_franja) },
              { key: 'max_grupos', header: 'Máx. grupos', align: 'right' },
              {
                key: 'quitar',
                header: '',
                render: (p) => (
                  <Button size="sm" variant="subtle" disabled={busy} onClick={() => void run(() => adminService.quitarFranja(p.cod_asignatura, p.id_franja), 'Franja quitada')}>
                    Quitar
                  </Button>
                ),
              },
            ]}
          />
        </>
      )}
    </ActionShell>
  )
}
