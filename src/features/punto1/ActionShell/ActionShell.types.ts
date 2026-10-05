import type { ReactNode } from 'react'
import type { Notice } from '@/hooks/useRunner'

export interface ActionShellProps {
  title: string
  description?: string
  /** Botones principales de la acción (arriba a la derecha). */
  actions?: ReactNode
  notice?: Notice
  onDismissNotice?: () => void
  loading?: boolean
  error?: string
  children?: ReactNode
}
