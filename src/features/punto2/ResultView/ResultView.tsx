import { Badge, DataTable } from '@/ui'
import styles from './ResultView.module.css'
import type { ResultViewProps } from './ResultView.types'

export function ResultView({ result, error, loading = false, idleMessage = 'Ejecuta la consulta para ver el resultado.' }: ResultViewProps) {
  if (loading) return <p className={styles.muted}>Ejecutando…</p>
  if (error) {
    return (
      <div className={styles.error} role="alert">
        <Badge tone="danger">Error</Badge>
        <span>{error.message}</span>
      </div>
    )
  }
  if (!result) return <p className={styles.muted}>{idleMessage}</p>

  return (
    <div className={styles.result}>
      <div className={styles.meta}>
        <Badge tone="success">
          {result.rowCount} {result.rowCount === 1 ? 'fila' : 'filas'}
        </Badge>
        <span className={styles.muted}>{result.durationMs} ms</span>
      </div>
      <DataTable rows={result.rows} compact maxHeight="md" emptyMessage="La consulta no devolvió filas" />
    </div>
  )
}
