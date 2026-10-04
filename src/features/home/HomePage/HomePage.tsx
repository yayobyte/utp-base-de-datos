import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/ui'
import styles from './HomePage.module.css'
import type { HomePageProps } from './HomePage.types'

export function HomePage({ points }: HomePageProps) {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Bases de Datos I · IS644 · UTP</p>
        <h1 className={styles.headline}>Examen final, resuelto y ejecutable</h1>
        <p className={styles.lead}>
          Tres puntos: un modelo E-ER convertido en sistema, consultas SQL sobre una base de datos real y la normalización
          de una tabla paso a paso.
        </p>
      </section>

      <section className={styles.grid} aria-label="Puntos del examen">
        {points.map((p) => (
          <Card key={p.id} as="article" variant={p.number === 1 ? 'dark' : 'soft'} className={styles.card}>
            <p className={styles.cardEyebrow}>
              Punto {p.number} · {p.shortLabel}
            </p>
            <h2 className={styles.cardTitle}>{p.title}</h2>
            <p className={styles.cardText}>{p.summary}</p>
            <Button variant={p.number === 1 ? 'secondary' : 'primary'} onClick={() => navigate(p.path)}>
              {p.cta}
            </Button>
          </Card>
        ))}
      </section>
    </div>
  )
}
