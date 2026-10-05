import { FASES, faseIndex } from '@/domain/punto1/fases'
import { Badge } from '@/ui'
import styles from './PhaseBanner.module.css'
import type { PhaseBannerProps } from './PhaseBanner.types'

/** Calendario académico: fase actual, semana simulada y estado de la matrícula extemporánea. */
export function PhaseBanner({ calendario }: PhaseBannerProps) {
  const actual = faseIndex(calendario.fase)
  return (
    <div className={styles.banner}>
      <div className={styles.meta}>
        <span className={styles.periodo}>Periodo {calendario.periodo}</span>
        <Badge tone="outline">Semana {calendario.semana_actual}</Badge>
        {calendario.extemporanea && <Badge tone="warning">Matrícula extemporánea</Badge>}
        {!calendario.aprobado_en && <Badge tone="warning">Calendario sin aprobar</Badge>}
      </div>
      <ol className={styles.phases} aria-label="Fases del calendario">
        {FASES.map((f, i) => (
          <li
            key={f.id}
            className={[styles.phase, i < actual && styles.done, i === actual && styles.current].filter(Boolean).join(' ')}
            aria-current={i === actual ? 'step' : undefined}
            title={f.descripcion}
          >
            {f.label}
          </li>
        ))}
      </ol>
    </div>
  )
}
