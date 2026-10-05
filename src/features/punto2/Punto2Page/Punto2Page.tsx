import { useCallback, useState } from 'react'
import { DataError } from '@/data'
import { EXAM_QUERIES, toScript, type ExamQuery } from '@/domain/punto2/examQueries'
import { useAsync } from '@/hooks/useAsync'
import { EXAM_POINTS } from '@/layout/navigation'
import { SectionHeader } from '@/layout/SectionHeader/SectionHeader'
import { punto2Service } from '@/services/punto2/punto2Service'
import { Badge, Button, Modal, Toast } from '@/ui'
import { ExamPointCard } from '../ExamPointCard/ExamPointCard'
import { SqlConsole } from '../SqlConsole/SqlConsole'
import { TablesPanel } from '../TablesPanel/TablesPanel'
import styles from './Punto2Page.module.css'
import type { Notice, Punto2PageProps } from './Punto2Page.types'

const POINT = EXAM_POINTS.find((p) => p.id === 'punto-2')!
const EYEBROW = `Punto ${POINT.number} · ${POINT.shortLabel}`
const DESCRIPTION =
  'Base de datos StayHome en PostgreSQL real, ejecutándose en tu navegador. Escribe consultas en la consola o abre una pregunta del examen para ver y ejecutar su SQL. Las tablas se actualizan tras cada ejecución.'

/** Página del punto 2: PostgreSQL (PGlite) en el navegador, con las mismas migraciones de databases/punto-2. */
export function Punto2Page({ initialScript = 'SELECT * FROM dvd;' }: Punto2PageProps) {
  const tables = useAsync(() => punto2Service.loadTables())
  const [script, setScript] = useState(initialScript)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [notice, setNotice] = useState<Notice>()

  /** Ejecuta algo y, pase lo que pase, recarga las tablas para que siempre reflejen la BD. */
  const runAndRefresh = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        return await fn()
      } finally {
        void tables.reload()
      }
    },
    [tables],
  )

  const runExamPoint = (query: ExamQuery) => runAndRefresh(() => punto2Service.runExamPoint(query.id))
  const runConsole = (s: string) => runAndRefresh(() => punto2Service.runConsole(s))

  const openInConsole = (query: ExamQuery) => {
    setScript(toScript(query))
    document.getElementById('consola')?.scrollIntoView?.({ behavior: 'smooth' })
  }

  const reset = async () => {
    setConfirmReset(false)
    setResetting(true)
    try {
      await runAndRefresh(() => punto2Service.reset())
      setNotice({ tone: 'success', message: 'Datos restablecidos al estado original del examen.' })
    } catch (e) {
      setNotice({ tone: 'error', message: DataError.from(e).message })
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow={EYEBROW}
        title={POINT.title}
        description={DESCRIPTION}
        actions={
          <Button variant="secondary" onClick={() => setConfirmReset(true)} loading={resetting}>
            Restablecer datos
          </Button>
        }
      />

      <div className={styles.engine}>
        <Badge tone="outline">PostgreSQL en el navegador</Badge>
        <span className={styles.engineText}>
          {tables.loading && !tables.data
            ? 'Iniciando la base de datos…'
            : 'Cada visitante tiene su propia copia: recargar la página o «Restablecer datos» vuelve al estado original.'}
        </span>
      </div>

      {notice && (
        <div className={styles.notice}>
          <Toast message={notice.message} tone={notice.tone} onDismiss={() => setNotice(undefined)} />
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          <SqlConsole value={script} onChange={setScript} onRun={runConsole} />
          <section className={styles.points} aria-label="Preguntas del examen">
            <h2 className={styles.pointsTitle}>Preguntas del examen</h2>
            {EXAM_QUERIES.map((q) => (
              <ExamPointCard key={q.id} query={q} onRun={runExamPoint} onOpenInConsole={openInConsole} />
            ))}
          </section>
        </div>
        <div className={styles.side}>
          <TablesPanel tables={tables.data} loading={tables.loading} error={tables.error} onReload={() => void tables.reload()} />
        </div>
      </div>

      <Modal
        open={confirmReset}
        title="¿Restablecer los datos?"
        onClose={() => setConfirmReset(false)}
        footer={
          <>
            <Button variant="subtle" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void reset()}>Restablecer</Button>
          </>
        }
      >
        Las 11 tablas vuelven a los datos originales del examen. Se pierden los cambios hechos con los puntos d, e o la consola.
      </Modal>
    </>
  )
}

