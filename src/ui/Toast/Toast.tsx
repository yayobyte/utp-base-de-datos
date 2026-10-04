import styles from './Toast.module.css'
import type { ToastProps, ToastTone } from './Toast.types'

const ICONS: Record<ToastTone, string> = { info: 'i', success: '✓', error: '✕' }

export function Toast({ message, tone = 'info', onDismiss }: ToastProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={[styles.toast, styles[tone]].join(' ')}>
      <span className={styles.icon} aria-hidden="true">
        {ICONS[tone]}
      </span>
      <span className={styles.message}>{message}</span>
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Cerrar aviso">
          ✕
        </button>
      )}
    </div>
  )
}
