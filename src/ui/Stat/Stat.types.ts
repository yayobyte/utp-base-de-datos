export interface StatProps {
  label: string
  value: string | number
  helper?: string
  /** Valor entre 0 y 1 para mostrar una barra de progreso. */
  progress?: number
}
