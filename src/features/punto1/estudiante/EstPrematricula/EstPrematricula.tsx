import { useEffect, useState } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { estudianteService } from '@/services/punto1'
import { Badge, Button } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'
import styles from './EstPrematricula.module.css'

/** Prematrícula inteligente: solo se pueden marcar las asignaturas permitidas por el plan y el reglamento. */
export function EstPrematricula() {
  const { persona } = usePunto1()
  const { data, loading, error, reload } = useAsync(() => estudianteService.prematricula(persona.id_persona), [persona.id_persona])
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const [seleccion, setSeleccion] = useState<string[]>([])

  useEffect(() => {
    if (data) setSeleccion(data.seleccion)
  }, [data])

  const toggle = (cod: string) => setSeleccion((s) => (s.includes(cod) ? s.filter((c) => c !== cod) : [...s, cod]))
  const creditos = (data?.opciones ?? []).filter((o) => seleccion.includes(o.asignatura.cod_asignatura)).reduce((s, o) => s + o.asignatura.creditos, 0)

  return (
    <ActionShell
      title="Prematrícula"
      description="Se muestran las asignaturas de tu plan que aún no apruebas. Las bloqueadas indican qué prerrequisito falta."
      loading={loading && !data}
      error={error?.message}
      notice={notice}
      onDismissNotice={clearNotice}
      actions={
        <Button disabled={busy} onClick={() => void run(() => estudianteService.enviarPrematricula(persona.id_persona, seleccion), 'Prematrícula guardada')}>
          Guardar prematrícula ({creditos} créditos)
        </Button>
      }
    >
      <ul className={styles.list}>
        {data?.opciones.map((o) => {
          const cod = o.asignatura.cod_asignatura
          return (
            <li key={cod} className={[styles.item, !o.elegible && styles.blocked].filter(Boolean).join(' ')}>
              <label className={styles.label}>
                <input type="checkbox" disabled={!o.elegible || busy} checked={seleccion.includes(cod)} onChange={() => toggle(cod)} />
                <span className={styles.name}>
                  {cod} · {o.asignatura.nombre}
                </span>
                <Badge>{o.asignatura.creditos} cr</Badge>
                <Badge tone="outline">Sem. {o.asignatura.semestre}</Badge>
                {!o.programada && <Badge tone="warning">Sin franja este periodo</Badge>}
              </label>
              {o.motivo && <span className={styles.reason}>🔒 {o.motivo}</span>}
              {o.simultaneas.length > 0 && <span className={styles.reason}>Debe cursarse junto con {o.simultaneas.join(', ')}</span>}
            </li>
          )
        })}
      </ul>
    </ActionShell>
  )
}
