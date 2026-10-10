import { Handle, Position } from '@xyflow/react'
import { memo } from 'react'
import { handleId } from '@/domain/talleres/diagramLayout'
import styles from './TableNode.module.css'
import type { TableNodeProps } from './TableNode.types'

const formatCell = (v: unknown) => (v === null || v === undefined ? 'NULL' : typeof v === 'object' ? JSON.stringify(v) : String(v))

/** Tabla en el diagrama: columnas con PK/FK (cada una con su conector) y una muestra de filas. */
function TableNodeBase({ data }: TableNodeProps) {
  const { name, kind, columns, rows, total } = data
  return (
    <div className={styles.node} data-table={name}>
      <header className={styles.header}>
        <span className={styles.name}>{name}</span>
        {kind === 'view' && <span className={styles.tag}>vista</span>}
        <span className={styles.count}>{total}</span>
      </header>

      <ul className={styles.columns}>
        {columns.map((c) => (
          <li key={c.name} className={styles.column}>
            <Handle type="target" position={Position.Left} id={handleId(c.name, 'in')} className={styles.handle} isConnectable={false} />
            <span className={styles.keys}>
              {c.pk && <span className={styles.pk}>PK</span>}
              {c.fk && <span className={styles.fk}>FK</span>}
            </span>
            <span className={styles.colName}>{c.name}</span>
            <span className={styles.colType}>{c.fk ? `→ ${c.fk}` : c.type}</span>
            <Handle type="source" position={Position.Right} id={handleId(c.name, 'out')} className={styles.handle} isConnectable={false} />
          </li>
        ))}
      </ul>

      {/* nodrag/nowheel: se puede seleccionar texto y desplazar la muestra sin mover el diagrama. */}
      <div className={`${styles.data} nodrag nowheel`}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.name}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(columns.length, 1)} className={styles.empty}>
                  Sin filas
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.name} className={r[c.name] === null || r[c.name] === undefined ? styles.null : undefined}>
                      {formatCell(r[c.name])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className={styles.footer}>
        {rows.length < total ? `${rows.length} de ${total} filas` : `${total} ${total === 1 ? 'fila' : 'filas'}`}
      </footer>
    </div>
  )
}

export const TableNode = memo(TableNodeBase)
