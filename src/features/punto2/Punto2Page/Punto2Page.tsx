import { useCallback, useState } from 'react'
import { DataError } from '@/data'
import { EXAM_QUERIES, toScript, type ExamQuery } from '@/domain/punto2/examQueries'
import { SupabaseGuard } from '@/features/shared/SupabaseGuard/SupabaseGuard'
import { useAsync } from '@/hooks/useAsync'
import { useProjectStatus } from '@/hooks/useProjectStatus'
import { EXAM_POINTS } from '@/layout/navigation'
import { SectionHeader } from '@/layout/SectionHeader/SectionHeader'
import { punto2Service } from '@/services/punto2/punto2Service'
import { Button, Chip, Modal, Toast } from '@/ui'
import { ExamPointCard } from '../ExamPointCard/ExamPointCard'
import { SqlConsole } from '../SqlConsole/SqlConsole'
import { TablesPanel } from '../TablesPanel/TablesPanel'
import styles from './Punto2Page.module.css'
import type { Notice, Punto2PageProps } from './Punto2Page.types'

const POINT = EXAM_POINTS.find((p) => p.id === 'punto-2')!
const EYEBROW = `Punto ${POINT.number} · ${POINT.shortLabel}`
const DESCRIPTION =
  'Base de datos StayHome en PostgreSQL (Supabase). Ejecuta cada respuesta, revisa el SQL y su explicación, o escribe tus propias consultas. Las tablas se actualizan tras cada ejecución.'

function Punto2Content({ initialScript = 'SELECT * FROM dvd;' }: Punto2PageProps) {
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

      {notice && (
        <div className={styles.notice}>
          <Toast message={notice.message} tone={notice.tone} onDismiss={() => setNotice(undefined)} />
        </div>
      )}

      <nav className={styles.jump} aria-label="Ir a una pregunta">
        {EXAM_QUERIES.map((q) => (
          <Chip key={q.id} onClick={() => document.getElementById(`punto-${q.id}`)?.scrollIntoView?.({ behavior: 'smooth' })}>
            Punto {q.id}
          </Chip>
        ))}
        <Chip onClick={() => document.getElementById('consola')?.scrollIntoView?.({ behavior: 'smooth' })}>Consola SQL</Chip>
      </nav>

      <div className={styles.layout}>
        <div className={styles.main}>
          {EXAM_QUERIES.map((q) => (
            <ExamPointCard key={q.id} query={q} onRun={runExamPoint} onOpenInConsole={openInConsole} />
          ))}
          <SqlConsole value={script} onChange={setScript} onRun={runConsole} />
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

/** Página del punto 2. Sin credenciales de la BD #2 muestra cómo configurarlas. */
export function Punto2Page(props: Punto2PageProps) {
  const { configured } = useProjectStatus('p2')
  if (configured) return <Punto2Content {...props} />
  return (
    <>
      <SectionHeader eyebrow={EYEBROW} title={POINT.title} description={DESCRIPTION} />
      <SupabaseGuard project="p2">{null}</SupabaseGuard>
    </>
  )
}
