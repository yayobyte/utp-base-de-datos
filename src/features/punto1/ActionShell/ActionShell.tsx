import { Toast } from '@/ui'
import styles from './ActionShell.module.css'
import type { ActionShellProps } from './ActionShell.types'

/** Marco común de cada acción del punto 1: título, ayuda, botones, aviso de resultado y contenido. */
export function ActionShell({ title, description, actions, notice, onDismissNotice, loading, error, children }: ActionShellProps) {
  return (
    <section className={styles.shell} aria-label={title}>
      <header className={styles.header}>
        <div className={styles.text}>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {notice && <Toast message={notice.message} tone={notice.tone} onDismiss={onDismissNotice} />}
      {error && <Toast message={error} tone="error" />}
      {loading ? <p className={styles.muted}>Cargando…</p> : children}
    </section>
  )
}
