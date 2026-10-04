import type { ReactNode } from 'react'

export interface NavBarProps {
  brand: ReactNode
  /** Enlaces/acciones a la derecha (por ejemplo NavLink estilizados por el llamador). */
  children?: ReactNode
  tone?: 'light' | 'dark'
}
