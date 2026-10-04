import styles from './Stat.module.css'
import type { StatProps } from './Stat.types'

export function Stat({ label, value, helper, progress }: StatProps) {
  const pct = progress === undefined ? undefined : Math.min(Math.max(progress, 0), 1) * 100
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {pct !== undefined && (
        <span className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
          <span className={styles.bar} style={{ width: `${pct}%` }} />
        </span>
      )}
      {helper && <span className={styles.helper}>{helper}</span>}
    </div>
  )
}
