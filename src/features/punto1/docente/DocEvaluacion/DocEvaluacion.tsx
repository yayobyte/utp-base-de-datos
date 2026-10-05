import { useEffect, useState } from 'react'
import { validarPorcentajes } from '@/domain/punto1/evaluacion'
import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { docenteService, type FormaNueva } from '@/services/punto1'
import { Badge, Button } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { GroupPicker } from '../GroupPicker/GroupPicker'
import styles from './DocEvaluacion.module.css'

const PLANTILLA: FormaNueva[] = [
  { descripcion: 'Parcial 1', porcentaje: 30, fecha: null },
  { descripcion: 'Parcial 2', porcentaje: 30, fecha: null },
  { descripcion: 'Examen final', porcentaje: 40, fecha: null },
]

/** Forma de evaluación del grupo: componentes, porcentajes (100 %) y fechas de examen. */
export function DocEvaluacion() {
  const [grupo, setGrupo] = useState<number>()
  const { data, reload } = useAsync(() => (grupo ? docenteService.formas(grupo) : Promise.resolve([])), [grupo])
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const [filas, setFilas] = useState<FormaNueva[]>(PLANTILLA)

  useEffect(() => {
    if (data) setFilas(data.length ? data.map(({ descripcion, porcentaje, fecha }) => ({ descripcion, porcentaje, fecha })) : PLANTILLA)
  }, [data])

  const error = validarPorcentajes(filas)
  const total = filas.reduce((s, f) => s + Number(f.porcentaje || 0), 0)
  const set = (i: number, patch: Partial<FormaNueva>) => setFilas((fs) => fs.map((f, j) => (j === i ? { ...f, ...patch } : f)))

  return (
    <ActionShell title="Forma de evaluación" description="Define los componentes de la nota y la fecha de cada examen." notice={notice} onDismissNotice={clearNotice}>
      <GroupPicker value={grupo} onChange={setGrupo} />
      {grupo && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Componente</th>
                <th>%</th>
                <th>Fecha</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i}>
                  <td>
                    <input className={styles.input} aria-label={`Componente ${i + 1}`} value={f.descripcion} onChange={(e) => set(i, { descripcion: e.target.value })} />
                  </td>
                  <td>
                    <input className={styles.input} aria-label={`Porcentaje ${i + 1}`} type="number" min={1} max={100} value={f.porcentaje} onChange={(e) => set(i, { porcentaje: Number(e.target.value) })} />
                  </td>
                  <td>
                    <input className={styles.input} aria-label={`Fecha ${i + 1}`} type="date" value={f.fecha ?? ''} onChange={(e) => set(i, { fecha: e.target.value || null })} />
                  </td>
                  <td>
                    <Button size="sm" variant="subtle" onClick={() => setFilas((fs) => fs.filter((_, j) => j !== i))} disabled={filas.length === 1}>
                      Quitar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.footer}>
            <Button variant="subtle" size="sm" onClick={() => setFilas((fs) => [...fs, { descripcion: `Componente ${fs.length + 1}`, porcentaje: 10, fecha: null }])}>
              + Componente
            </Button>
            <Badge tone={error ? 'danger' : 'success'}>Total {total} %</Badge>
            <Button disabled={busy || Boolean(error)} onClick={() => void run(() => docenteService.guardarFormas(grupo, filas), 'Forma de evaluación guardada')}>
              Guardar
            </Button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </>
      )}
    </ActionShell>
  )
}
