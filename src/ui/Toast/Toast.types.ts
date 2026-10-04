export type ToastTone = 'info' | 'success' | 'error'

export interface ToastProps {
  message: string
  tone?: ToastTone
  onDismiss?: () => void
}
