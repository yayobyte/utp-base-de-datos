import { useId } from 'react'
import styles from './Select.module.css'
import type { SelectProps } from './Select.types'

export function Select({ label, options, placeholder, id, className, ...rest }: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')} htmlFor={selectId}>
      {label && <span className={styles.label}>{label}</span>}
      <select id={selectId} className={styles.select} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
