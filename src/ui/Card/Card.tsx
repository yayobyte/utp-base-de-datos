import styles from './Card.module.css'
import type { CardProps } from './Card.types'

export function Card({ variant = 'content', padding = 'lg', as: Tag = 'div', className, ...rest }: CardProps) {
  const classes = [styles.card, styles[variant], styles[`pad-${padding}`], className].filter(Boolean).join(' ')
  return <Tag className={classes} {...rest} />
}
