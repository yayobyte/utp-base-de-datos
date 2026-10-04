import { Outlet } from 'react-router-dom'
import { Footer } from '../Footer/Footer'
import { GlobalNav } from '../GlobalNav/GlobalNav'
import styles from './AppShell.module.css'
import type { AppShellProps } from './AppShell.types'

/** Marco común: navegación global + contenido de la ruta + pie. */
export function AppShell({ points }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <GlobalNav points={points} />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
