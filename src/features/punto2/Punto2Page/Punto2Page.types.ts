export interface Punto2PageProps {
  /** Texto inicial de la consola. */
  initialScript?: string
}

export interface Notice {
  tone: 'success' | 'error' | 'info'
  message: string
}
