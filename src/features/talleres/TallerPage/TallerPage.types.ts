import type { TallerId } from '@/domain/talleres/catalog'

export interface TallerPageProps {
  /** Taller a mostrar; si se omite, se toma de la URL (/talleres/:tallerId). */
  tallerId?: TallerId
}

export interface Notice {
  tone: 'success' | 'error' | 'info'
  message: string
}
