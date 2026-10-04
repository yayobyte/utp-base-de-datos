import styles from './DataTable.module.css'
import type { DataTableColumn, DataTableProps, Row } from './DataTable.types'

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function DataTable<T extends Row>({
  rows,
  columns,
  caption,
  emptyMessage = 'Sin filas',
  compact = false,
  maxHeight = 'none',
  rowKey,
}: DataTableProps<T>) {
  const cols: DataTableColumn<T>[] =
    columns ?? Object.keys(rows[0] ?? {}).map((key) => ({ key, header: key }))

  return (
    <div className={[styles.wrapper, styles[`h-${maxHeight}`]].join(' ')}>
      <table className={[styles.table, compact && styles.compact].filter(Boolean).join(' ')}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key} className={[c.highlight && styles.highlight, c.align === 'right' && styles.right].filter(Boolean).join(' ')}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(cols.length, 1)} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey ? rowKey(row, i) : i}>
                {cols.map((c) => {
                  const raw = row[c.key]
                  const isNull = !c.render && (raw === null || raw === undefined)
                  return (
                    <td
                      key={c.key}
                      className={[c.highlight && styles.highlight, c.align === 'right' && styles.right, isNull && styles.null]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {c.render ? c.render(row) : formatCell(raw)}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
