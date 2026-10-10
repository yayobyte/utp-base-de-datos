import { Badge, Button, DataTable } from '@/ui'
import styles from './TallerTablesPanel.module.css'
import type { TallerTablesPanelProps } from './TallerTablesPanel.types'

/** Tablas y vistas actuales del taller (incluye las que cree el estudiante). Plegadas para no ocupar la página. */
export function TallerTablesPanel({ tables, loading, error, onReload }: TallerTablesPanelProps) {
  return (
    <aside className={styles.panel} aria-label="Tablas de la base de datos">
      <div className={styles.header}>
        <h2 className={styles.title}>Tablas</h2>
        <Button variant="subtle" size="sm" onClick={onReload} loading={loading}>
          Recargar
        </Button>
      </div>
      {error && <p className={styles.error}>✕ {error.message}</p>}
      {tables?.length === 0 && <p className={styles.muted}>No hay tablas en el esquema public.</p>}
      {!tables && !error && <p className={styles.muted}>Iniciando la base de datos…</p>}
      <div className={styles.list}>
        {tables?.map((t) => (
          <details key={t.name} className={styles.table}>
            <summary className={styles.summary}>
              <span className={styles.name}>{t.name}</span>
              {t.kind === 'view' && <Badge tone="outline">vista</Badge>}
              <Badge>{t.total}</Badge>
            </summary>
            {t.rows.length < t.total && (
              <p className={styles.muted}>
                Primeras {t.rows.length} de {t.total} filas.
              </p>
            )}
            <DataTable rows={t.rows} compact maxHeight="sm" emptyMessage="Sin filas" />
          </details>
        ))}
      </div>
    </aside>
  )
}
