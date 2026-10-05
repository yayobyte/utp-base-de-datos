import { useState } from 'react'
import { parseNota } from '@/domain/punto1/evaluacion'
import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { docenteService } from '@/services/punto1'
import { Badge } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { GroupPicker } from '../GroupPicker/GroupPicker'
import styles from './DocNotas.module.css'

const key = (ev: number, est: string) => `${ev}:${est}`

/** Planilla de notas: máscara 0.0 – 5.0 y actualización inmediata (UI optimista) mientras se guarda. */
export function DocNotas() {
  const [grupo, setGrupo] = useState<number>()
  const { data, loading, reload } = useAsync(() => (grupo ? docenteService.planilla(grupo) : Promise.resolve(undefined)), [grupo])
  const { run, notice, clearNotice } = useRunner(reload)
  const [borrador, setBorrador] = useState<Record<string, string>>({})
  const [errores, setErrores] = useState<Record<string, string>>({})

  const valor = (ev: number, est: string) => {
    const k = key(ev, est)
    if (k in borrador) return borrador[k]
    const n = data?.notas.find((x) => x.id_evaluacion === ev && x.id_estudiante === est)
    return n ? Number(n.valor).toFixed(1) : ''
  }

  const guardar = (ev: number, est: string) => {
    const k = key(ev, est)
    const texto = borrador[k]
    if (texto === undefined || texto === '') return
    const r = parseNota(texto)
    if (!r.ok) {
      setErrores((e) => ({ ...e, [k]: r.error }))
      return
    }
    setErrores(({ [k]: _omit, ...rest }) => rest)
    setBorrador((b) => ({ ...b, [k]: r.valor.toFixed(1) })) // optimista: se ve de inmediato
    void run(async () => {
      await docenteService.guardarNota(ev, est, r.valor)
      setBorrador(({ [k]: _done, ...rest }) => rest)
    })
  }

  return (
    <ActionShell title="Registrar notas" description="Escribe la nota (0.0 a 5.0, un decimal) y pasa a la siguiente celda: se guarda sola." notice={notice} onDismissNotice={clearNotice}>
      <GroupPicker value={grupo} onChange={setGrupo} />
      {loading && !data && <p className={styles.muted}>Cargando planilla…</p>}
      {data && data.formas.length === 0 && <p className={styles.muted}>Primero define la forma de evaluación del grupo.</p>}
      {data && data.formas.length > 0 && (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estudiante</th>
                {data.formas.map((f) => (
                  <th key={f.id_evaluacion}>
                    {f.descripcion} <span className={styles.pct}>{f.porcentaje}%</span>
                  </th>
                ))}
                <th>Definitiva</th>
              </tr>
            </thead>
            <tbody>
              {data.estudiantes.map((e) => (
                <tr key={e.id}>
                  <td>
                    {e.nombre} {e.estado === 'transicion' && <Badge tone="outline">Transición</Badge>}
                  </td>
                  {data.formas.map((f) => {
                    const k = key(f.id_evaluacion, e.id)
                    return (
                      <td key={f.id_evaluacion}>
                        <input
                          className={[styles.input, errores[k] && styles.invalid].filter(Boolean).join(' ')}
                          aria-label={`Nota ${f.descripcion} de ${e.nombre}`}
                          inputMode="decimal"
                          maxLength={3}
                          value={valor(f.id_evaluacion, e.id)}
                          title={errores[k]}
                          onChange={(ev) => setBorrador((b) => ({ ...b, [k]: ev.target.value }))}
                          onBlur={() => guardar(f.id_evaluacion, e.id)}
                          onKeyDown={(ev) => ev.key === 'Enter' && (ev.target as HTMLInputElement).blur()}
                        />
                      </td>
                    )
                  })}
                  <td>
                    <Badge tone={e.final >= 3 ? 'success' : 'danger'}>{e.final.toFixed(2)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {Object.values(errores)[0] && <p className={styles.error}>✕ {Object.values(errores)[0]}</p>}
    </ActionShell>
  )
}
