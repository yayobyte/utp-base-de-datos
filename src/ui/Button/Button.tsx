import styles from './Button.module.css'
import type { ButtonProps } from './Button.types'

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
      {loading ? 'Cargando…' : children}
    </button>
  )
}
