import type { ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children?: ReactNode
  /** Botones del pie (por ejemplo Cancelar / Confirmar). */
  footer?: ReactNode
}
