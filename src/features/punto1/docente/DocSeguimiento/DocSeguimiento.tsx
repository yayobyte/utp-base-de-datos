import { useState } from 'react'
import { parseNota } from '@/domain/punto1/evaluacion'
import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { docenteService } from '@/services/punto1'
import { Button, Input } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { GroupPicker } from '../GroupPicker/GroupPicker'
import styles from './DocSeguimiento.module.css'

/** Notas de comportamiento y dedicación, solo para estudiantes en semestre de transición. */
export function DocSeguimiento() {
  const [grupo, setGrupo] = useState<number>()
  const { data, reload } = useAsync(() => (grupo ? docenteService.seguimiento(grupo) : Promise.resolve([])), [grupo])
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const [form, setForm] = useState<Record<string, { c: string; d: string }>>({})

  const v = (id: string, campo: 'c' | 'd', actual?: number) => form[id]?.[campo] ?? (actual != null ? Number(actual).toFixed(1) : '')

  return (
    <ActionShell title="Seguimiento de transición" description="Solo aparecen los estudiantes en estado «semestre de transición»." notice={notice} onDismissNotice={clearNotice}>
      <GroupPicker value={grupo} onChange={setGrupo} />
      {grupo && data?.length === 0 && <p className={styles.muted}>No hay estudiantes en transición en este grupo.</p>}
      {data?.map((e) => {
        const c = v(e.id, 'c', e.registro?.nota_comportamiento)
        const d = v(e.id, 'd', e.registro?.nota_dedicacion)
        const pc = parseNota(c)
        const pd = parseNota(d)
        return (
          <form
            key={e.id}
            className={styles.row}
            onSubmit={(ev) => {
              ev.preventDefault()
              if (pc.ok && pd.ok) void run(() => docenteService.guardarSeguimiento(grupo!, e.id, pc.valor, pd.valor), `Seguimiento de ${e.nombre} guardado`)
            }}
          >
            <strong className={styles.name}>{e.nombre}</strong>
            <Input label="Comportamiento" value={c} error={c && !pc.ok ? pc.error : undefined} onChange={(x) => setForm((f) => ({ ...f, [e.id]: { c: x.target.value, d } }))} />
            <Input label="Dedicación" value={d} error={d && !pd.ok ? pd.error : undefined} onChange={(x) => setForm((f) => ({ ...f, [e.id]: { c, d: x.target.value } }))} />
            <Button type="submit" disabled={busy || !pc.ok || !pd.ok}>
              Guardar
            </Button>
          </form>
        )
      })}
    </ActionShell>
  )
}
