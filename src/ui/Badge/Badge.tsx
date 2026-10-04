import styles from './Badge.module.css'
import type { BadgeProps, BadgeTone } from './Badge.types'

// Los estados se distinguen con icono (sin color de acento, según DESIGN.md).
const ICONS: Partial<Record<BadgeTone, string>> = { success: '✓', warning: '!', danger: '✕' }

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  const icon = ICONS[tone]
  return (
    <span className={[styles.badge, styles[tone]].join(' ')}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
