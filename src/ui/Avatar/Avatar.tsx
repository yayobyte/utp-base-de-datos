import styles from './Avatar.module.css'
import type { AvatarButtonProps } from './Avatar.types'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

/** Botón con avatar circular (iniciales), ícono opcional y el primer nombre debajo. */
export function AvatarButton({ name, selected = false, badge, className, type = 'button', ...rest }: AvatarButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, selected && styles.selected, className].filter(Boolean).join(' ')}
      aria-pressed={selected}
      aria-label={name}
      {...rest}
    >
      <span className={styles.avatar} aria-hidden="true">
        {initials(name)}
        {badge && <span className={styles.badge}>{badge}</span>}
      </span>
      <span className={styles.name} aria-hidden="true">
        {name.split(' ')[0]}
      </span>
    </button>
  )
}
