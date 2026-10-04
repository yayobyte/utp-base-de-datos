import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import type { FooterProps } from './Footer.types'

export function Footer({ course = 'Bases de Datos I (IS644) · Universidad Tecnológica de Pereira' }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.title}>Examen Final</p>
        <p className={styles.text}>{course}</p>
        <p className={styles.mute}>Cristian Gutiérrez González</p>
        <Link to="/estado" className={styles.link}>
          Estado del despliegue
        </Link>
      </div>
    </footer>
  )
}
