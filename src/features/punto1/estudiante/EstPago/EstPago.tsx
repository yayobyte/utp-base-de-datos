import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { estudianteService } from '@/services/punto1'
import { Badge, Button, Stat } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'
import styles from './EstPago.module.css'

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

/** Pago de matrícula (normal en la fase de pago; extemporáneo en ajustes si Registro lo habilita). */
export function EstPago() {
  const { persona } = usePunto1()
  const { data, loading, error, reload } = useAsync(() => estudianteService.matricula(persona.id_persona), [persona.id_persona])
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const m = data?.matricula

  return (
    <ActionShell title="Pagar matrícula" loading={loading && !data} error={error?.message} notice={notice} onDismissNotice={clearNotice}>
      {data && !m && <p className={styles.muted}>No tienes prematrícula en este periodo.</p>}
      {data && m && (
        <>
          <div className={styles.stats}>
            <Stat label="Créditos prematriculados" value={data.creditos} />
            <Stat label="Valor (simulado)" value={COP.format(data.valor)} />
          </div>
          <p className={styles.estado}>
            Estado del pago: <Badge tone={m.estado_pago === 'pendiente' ? 'warning' : 'success'}>{m.estado_pago}</Badge>
            {m.retirado && <Badge tone="danger">Retirado por no pago</Badge>}
          </p>
          <div>
            <Button disabled={busy || m.estado_pago !== 'pendiente'} onClick={() => void run(() => estudianteService.pagar(persona.id_persona), 'Pago registrado')}>
              {data.calendario.fase === 'pago' ? 'Pagar' : 'Pagar (extemporáneo)'}
            </Button>
          </div>
        </>
      )}
    </ActionShell>
  )
}
