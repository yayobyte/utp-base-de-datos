import type { PrestamoRow } from '@/domain/punto3/normalizacion'
import { Badge, Button } from '@/ui'
import styles from './SourceEditor.module.css'
import type { SourceEditorProps } from './SourceEditor.types'

const FIELDS: { key: keyof PrestamoRow; label: string }[] = [
  { key: 'codLibro', label: 'CodLibro' },
  { key: 'titulo', label: 'Titulo' },
  { key: 'autor', label: 'Autor' },
  { key: 'editorial', label: 'Editorial' },
  { key: 'nombreLector', label: 'NombreLector' },
  { key: 'fechaDev', label: 'FechaDev' },
]

/** Modo sandbox: editar la tabla original y ver cómo se recalculan las formas normales. */
export function SourceEditor({ rows, edited, onChange, onReset }: SourceEditorProps) {
  return (
    <details className={styles.editor}>
      <summary className={styles.summary}>
        <span className={styles.title}>Editar datos de origen (sandbox)</span>
        {edited && <Badge tone="warning">Datos modificados</Badge>}
      </summary>
      <div className={styles.body}>
        <p className={styles.hint}>
          Cambia cualquier celda: por ejemplo, separa varios autores con «y» o «,», o repite una editorial. Todos los pasos se
          recalculan al instante.
        </p>
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {FIELDS.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {FIELDS.map((f) => (
                    <td key={f.key}>
                      <input
                        className={styles.input}
                        aria-label={`${f.label} fila ${i + 1}`}
                        value={row[f.key]}
                        onChange={(e) => onChange(i, f.key, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <Button variant="subtle" size="sm" onClick={onReset} disabled={!edited}>
            Volver a los datos del examen
          </Button>
        </div>
      </div>
    </details>
  )
}
