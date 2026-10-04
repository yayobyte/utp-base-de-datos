import { useId } from 'react'
import styles from './Input.module.css'
import type { InputProps } from './Input.types'

export function Input({ label, hint, error, tone = 'soft', id, className, ...rest }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const help = error ?? hint
  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={inputId}>
      {label && <span className={styles.label}>{label}</span>}
      <input
        id={inputId}
        className={[styles.input, styles[tone], error && styles.invalid].filter(Boolean).join(' ')}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {help && <span className={error ? styles.error : styles.hint}>{error ? `✕ ${error}` : help}</span>}
    </label>
  )
}
