import { useId } from 'react'
import styles from './TextArea.module.css'
import type { TextAreaProps } from './TextArea.types'

export function TextArea({ label, hint, monospace = false, id, className, rows = 4, ...rest }: TextAreaProps) {
  const autoId = useId()
  const areaId = id ?? autoId
  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={areaId}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea
        id={areaId}
        rows={rows}
        spellCheck={!monospace}
        className={[styles.area, monospace && styles.mono].filter(Boolean).join(' ')}
        {...rest}
      />
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  )
}
