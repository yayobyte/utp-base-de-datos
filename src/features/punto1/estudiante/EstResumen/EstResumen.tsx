import { useAsync } from '@/hooks/useAsync'
import { estudianteService } from '@/services/punto1'
import { Badge, DataTable, Stat } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'
import styles from './EstResumen.module.css'

const TONO_ESTADO = { normal: 'success', prueba: 'warning', transicion: 'outline', fuera: 'danger' } as const

/** Dashboard de progreso: atributos derivados (promedio integral, créditos) y estado (subclase). */
export function EstResumen() {
  const { persona, calendario } = usePunto1()
  const { data, loading, error } = useAsync(() => estudianteService.resumen(persona.id_persona), [persona.id_persona, calendario.fase])
  const r = data?.resumen

  return (
    <ActionShell title="Mi resumen académico" loading={loading && !data} error={error?.message}>
      {r && data && (
        <>
          <div className={styles.estado}>
            Estado: <Badge tone={TONO_ESTADO[r.estado]}>{r.estado}</Badge>
            {r.en_bloque && <Badge tone="outline">En bloque</Badge>}
            {r.periodos_en_prueba != null && <span>{r.periodos_en_prueba} periodo(s) en prueba</span>}
            {r.plan_anterior && <span>Plan anterior: {r.plan_anterior}</span>}
            {r.motivo_retiro && <span>{r.motivo_retiro}{r.hasta_periodo ? ` (hasta ${r.hasta_periodo})` : ''}</span>}
          </div>
          <div className={styles.stats}>
            <Stat label="Promedio integral" value={Number(r.promedio_integral).toFixed(2)} progress={Number(r.promedio_integral) / 5} helper="Σ(nota × créditos) / Σ créditos" />
            <Stat label="Créditos aprobados" value={r.creditos_aprobados} helper={`de ${r.creditos_cursados} cursados`} />
          </div>
          <DataTable
            compact
            caption="Historial de notas"
            rows={data.historial}
            emptyMessage="Sin notas registradas"
            columns={[
              { key: 'periodo', header: 'Periodo' },
              { key: 'cod_asignatura', header: 'Código' },
              { key: 'asignatura', header: 'Asignatura', render: (h) => h.asignatura?.nombre ?? '' },
              { key: 'creditos', header: 'Créditos', align: 'right', render: (h) => h.asignatura?.creditos ?? '' },
              {
                key: 'nota_final',
                header: 'Nota',
                align: 'right',
                render: (h) => <Badge tone={Number(h.nota_final) >= 3 ? 'neutral' : 'danger'}>{Number(h.nota_final).toFixed(1)}</Badge>,
              },
            ]}
          />
        </>
      )}
    </ActionShell>
  )
}
