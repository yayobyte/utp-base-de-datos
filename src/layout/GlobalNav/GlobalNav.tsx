import { Link, NavLink } from 'react-router-dom'
import { NavBar } from '@/ui'
import styles from './GlobalNav.module.css'
import type { GlobalNavProps } from './GlobalNav.types'

export function GlobalNav({ points }: GlobalNavProps) {
  return (
    <NavBar
      brand={
        <Link to="/" className={styles.brand}>
          Examen Final IS644
        </Link>
      }
    >
      {points.map((p) => (
        <NavLink key={p.id} to={p.path} className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}>
          <span className={styles.number}>Punto {p.number}</span>
          <span className={styles.label}>{p.shortLabel}</span>
        </NavLink>
      ))}
    </NavBar>
  )
}
