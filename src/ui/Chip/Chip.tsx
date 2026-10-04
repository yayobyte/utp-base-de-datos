import styles from './Chip.module.css'
import type { ChipProps } from './Chip.types'

export function Chip({ selected = false, icon, className, children, type = 'button', ...rest }: ChipProps) {
  const classes = [styles.chip, selected && styles.selected, className].filter(Boolean).join(' ')
  return (
    <button type={type} className={classes} aria-pressed={selected} {...rest}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  )
}
