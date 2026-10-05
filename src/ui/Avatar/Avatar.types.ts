import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface AvatarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Nombre completo: se muestran las iniciales y el primer nombre debajo. */
  name: string
  selected?: boolean
  /** Ícono pequeño en la esquina (p. ej. el rol). */
  badge?: ReactNode
}
