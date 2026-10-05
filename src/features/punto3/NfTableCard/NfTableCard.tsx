import { Badge, DataTable } from '@/ui'
import styles from './NfTableCard.module.css'
import type { NfTableCardProps } from './NfTableCard.types'

/** Una relación resultante: nombre, filas, columnas clave (PK/FK) y columnas nuevas resaltadas. */
export function NfTableCard({ table }: NfTableCardProps) {
  const fks = table.columns.filter((c) => c.references)
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.name}>{table.name}</h3>
        <Badge>{table.rows.length} filas</Badge>
      </header>
      <DataTable
        compact
        rows={table.rows}
        columns={table.columns.map((c) => ({
          key: c.name,
          header: c.key ? `${c.name} · ${c.key}` : c.name,
          highlight: c.changed,
        }))}
      />
      {fks.length > 0 && (
        <p className={styles.refs}>
          {fks.map((c) => (
            <span key={c.name}>
              {c.name} → {c.references}
            </span>
          ))}
        </p>
      )}
    </article>
  )
}
