import styles from './DependencyList.module.css'
import type { DependencyListProps } from './DependencyList.types'

/** Dependencias funcionales del paso, como chips «A, B → C». */
export function DependencyList({ dependencies }: DependencyListProps) {
  return (
    <ul className={styles.list} aria-label="Dependencias funcionales">
      {dependencies.map((d, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.fd}>
            {d.from.join(', ')} <span className={styles.arrow}>→</span> {d.to.join(', ')}
          </span>
          {d.note && <span className={styles.note}>{d.note}</span>}
        </li>
      ))}
    </ul>
  )
}
