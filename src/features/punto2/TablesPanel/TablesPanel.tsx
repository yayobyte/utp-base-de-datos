import { PUNTO2_TABLES } from '@/data'
import { Badge, Button, DataTable } from '@/ui'
import styles from './TablesPanel.module.css'
import type { TablesPanelProps } from './TablesPanel.types'

/** Las 11 tablas del examen, siempre visibles y plegables. Se recargan tras cada ejecución. */
export function TablesPanel({ tables, loading, error, onReload }: TablesPanelProps) {
  return (
    <aside className={styles.panel} aria-label="Tablas de la base de datos">
      <div className={styles.header}>
        <h2 className={styles.title}>Tablas</h2>
        <Button variant="subtle" size="sm" onClick={onReload} loading={loading}>
          Recargar
        </Button>
      </div>
      {error && <p className={styles.error}>✕ {error.message}</p>}
      <div className={styles.list}>
        {PUNTO2_TABLES.map((name) => {
          const rows = tables?.[name] ?? []
          return (
            <details key={name} className={styles.table} open>
              <summary className={styles.summary}>
                <span className={styles.name}>{name}</span>
                <Badge>{tables ? rows.length : '…'}</Badge>
              </summary>
              <DataTable rows={rows} compact maxHeight="sm" emptyMessage={tables ? 'Sin filas' : 'Cargando…'} />
            </details>
          )
        })}
      </div>
    </aside>
  )
}
