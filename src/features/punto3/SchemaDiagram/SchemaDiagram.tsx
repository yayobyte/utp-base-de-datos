import styles from './SchemaDiagram.module.css'
import type { SchemaDiagramProps } from './SchemaDiagram.types'

/** Esquema final: una caja por relación con sus columnas, PK/FK y a qué tabla apunta cada FK. */
export function SchemaDiagram({ tables }: SchemaDiagramProps) {
  return (
    <div className={styles.diagram} aria-label="Esquema relacional final">
      {tables.map((t) => (
        <section key={t.name} className={styles.box}>
          <h4 className={styles.title}>{t.name}</h4>
          <ul className={styles.columns}>
            {t.columns.map((c) => (
              <li key={c.name} className={styles.column}>
                <span className={[styles.colName, c.key?.includes('PK') && styles.pk].filter(Boolean).join(' ')}>{c.name}</span>
                {c.key && <span className={styles.key}>{c.key}</span>}
                {c.references && <span className={styles.ref}>→ {c.references}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
