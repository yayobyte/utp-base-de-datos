import { Card } from '@/ui'
import { DependencyList } from '../DependencyList/DependencyList'
import { NfTableCard } from '../NfTableCard/NfTableCard'
import { SchemaDiagram } from '../SchemaDiagram/SchemaDiagram'
import styles from './StepView.module.css'
import type { StepViewProps } from './StepView.types'

/** Un paso de la normalización: explicación, cambios, dependencias y tablas antes/después. */
export function StepView({ step, previous }: StepViewProps) {
  return (
    <div className={styles.step}>
      <Card variant="soft" className={styles.explain}>
        <h2 className={styles.title}>
          {step.label} · {step.title}
        </h2>
        <p className={styles.text}>{step.explicacion}</p>
        <ul className={styles.changes}>
          {step.cambios.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Card>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Dependencias funcionales</h3>
        <DependencyList dependencies={step.dependencias} />
      </section>

      <div className={styles.compare}>
        {previous && (
          <section className={styles.column} aria-label={`Antes (${previous.label})`}>
            <h3 className={styles.sectionTitle}>Antes · {previous.label}</h3>
            {previous.tables.map((t) => (
              <NfTableCard key={t.name} table={t} />
            ))}
          </section>
        )}
        <section className={styles.column} aria-label={`Resultado (${step.label})`}>
          <h3 className={styles.sectionTitle}>
            {previous ? 'Después' : 'Tabla'} · {step.label}
          </h3>
          {step.tables.map((t) => (
            <NfTableCard key={t.name} table={t} />
          ))}
        </section>
      </div>

      {step.id === '3fn' && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Esquema final</h3>
          <SchemaDiagram tables={step.tables} />
        </section>
      )}

      <p className={styles.legend}>Columnas <u>subrayadas</u>: nuevas o modificadas en este paso · PK: llave primaria · FK: llave foránea</p>
    </div>
  )
}
