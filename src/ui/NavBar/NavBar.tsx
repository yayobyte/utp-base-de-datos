import styles from './NavBar.module.css'
import type { NavBarProps } from './NavBar.types'

export function NavBar({ brand, children, tone = 'light' }: NavBarProps) {
  return (
    <header className={[styles.bar, styles[tone]].join(' ')}>
      <div className={styles.inner}>
        <div className={styles.brand}>{brand}</div>
        <nav className={styles.links}>{children}</nav>
      </div>
    </header>
  )
}
