import { useNavigate } from 'react-router-dom'
import { SectionHeader } from '@/layout/SectionHeader/SectionHeader'
import { Button, Card } from '@/ui'
import styles from './TalleresPage.module.css'
import type { TalleresPageProps } from './TalleresPage.types'

/** Índice de talleres de clase (aparte de los tres puntos del examen). */
export function TalleresPage({ talleres }: TalleresPageProps) {
  const navigate = useNavigate()
  return (
    <>
      <SectionHeader
        eyebrow="Material de clase"
        title="Talleres"
        description="Cada taller tiene su propia base de datos PostgreSQL en tu navegador, cargada con el script de clase. Puedes crear, modificar y borrar sin miedo: «Restaurar» la deja como al principio."
      />
      <section className={styles.grid} aria-label="Talleres">
        {talleres.map((t) => (
          <Card key={t.id} variant="soft" className={styles.card}>
            <p className={styles.eyebrow}>Taller · {t.shortLabel}</p>
            <h2 className={styles.title}>{t.title}</h2>
            <p className={styles.text}>{t.summary}</p>
            <Button onClick={() => navigate(t.path)}>Abrir taller</Button>
          </Card>
        ))}
      </section>
    </>
  )
}
