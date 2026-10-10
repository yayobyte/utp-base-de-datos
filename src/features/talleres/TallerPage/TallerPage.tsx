import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DataError } from '@/data'
import { findTaller, type Taller } from '@/domain/talleres/catalog'
import type { TallerExercise } from '@/domain/talleres/exercises'
import { SqlConsole } from '@/features/punto2/SqlConsole/SqlConsole'
import { NotFound } from '@/features/shared/NotFound/NotFound'
import { useAsync } from '@/hooks/useAsync'
import { SectionHeader } from '@/layout/SectionHeader/SectionHeader'
import { tallerService } from '@/services/talleres/tallerService'
import { Badge, Button, CodeBlock, Modal, Toast } from '@/ui'
import { ExerciseCard } from '../ExerciseCard/ExerciseCard'
import { SchemaDiagram } from '../SchemaDiagram/SchemaDiagram'
import { TallerTablesPanel } from '../TallerTablesPanel/TallerTablesPanel'
import styles from './TallerPage.module.css'
import type { Notice, TallerPageProps } from './TallerPage.types'

const CONSOLE_SUBTITLE = 'PostgreSQL real · cualquier sentencia · Ctrl/⌘ + Enter'
const CONSOLE_HINT = 'Admite CREATE, ALTER, DROP, vistas y transacciones. Se muestra el resultado de la última consulta que devuelve filas.'

/** Taller de clase: PostgreSQL propio en el navegador, guardado entre visitas. */
export function TallerPage({ tallerId }: TallerPageProps) {
  const params = useParams()
  const taller = findTaller(tallerId ?? params.tallerId)
  if (!taller) return <NotFound />
  // key: al cambiar de taller se reinicia todo el estado de la página.
  return <TallerContent key={taller.id} taller={taller} />
}

function TallerContent({ taller }: { taller: Taller }) {
  const tables = useAsync(() => tallerService.loadTables(taller))
  const schema = useAsync(() => tallerService.loadSchema(taller))
  const [layoutKey, setLayoutKey] = useState(0)
  const [script, setScript] = useState(taller.initialQuery)
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
        void schema.reload()
      }
    },
    [tables, schema],
  )

  const runConsole = (s: string) => runAndRefresh(() => tallerService.run(taller, s))
  const runExercise = (e: TallerExercise) => runAndRefresh(() => tallerService.run(taller, e.sql))

  const openInConsole = (e: TallerExercise) => {
    setScript(`-- ${e.title}\n${e.sql}`)
    document.getElementById('consola')?.scrollIntoView?.({ behavior: 'smooth' })
  }

  const reset = async () => {
    setConfirmReset(false)
    setResetting(true)
    try {
      await runAndRefresh(() => tallerService.reset(taller))
      setNotice({ tone: 'success', message: 'Base de datos restaurada con el script original del taller.' })
    } catch (e) {
      setNotice({ tone: 'error', message: DataError.from(e).message })
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow={`Taller · ${taller.shortLabel}`}
        title={taller.title}
        description={taller.summary}
        actions={
          <Button variant="secondary" onClick={() => setConfirmReset(true)} loading={resetting}>
            Restaurar
          </Button>
        }
      />

      <div className={styles.engine}>
        <Badge tone="outline">PostgreSQL en el navegador</Badge>
        <span className={styles.engineText}>
          {tables.loading && !tables.data
            ? 'Iniciando la base de datos…'
            : 'Tu copia se guarda en este navegador: los cambios siguen ahí al volver. «Restaurar» vuelve al script original.'}
        </span>
      </div>

      {notice && (
        <div className={styles.notice}>
          <Toast message={notice.message} tone={notice.tone} onDismiss={() => setNotice(undefined)} />
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          <SqlConsole
            value={script}
            onChange={setScript}
            onRun={runConsole}
            subtitle={CONSOLE_SUBTITLE}
            inputHint={CONSOLE_HINT}
            placeholder={taller.initialQuery}
          />

          {taller.exercises.length > 0 && (
            <section className={styles.section} aria-label="Ejercicios del taller">
              <h2 className={styles.sectionTitle}>Ejercicios</h2>
              <p className={styles.sectionText}>Ejecútalos en orden: algunos dependen de los anteriores (c → d → e, vistas antes de g).</p>
              {taller.exercises.map((e) => (
                <ExerciseCard key={e.id} exercise={e} onRun={runExercise} onOpenInConsole={openInConsole} />
              ))}
            </section>
          )}

          <details className={styles.script}>
            <summary className={styles.scriptSummary}>Script de creación · {taller.setupFile}</summary>
            <CodeBlock code={taller.setupSql} language="sql" />
          </details>
        </div>
        <div className={styles.side}>
          <TallerTablesPanel tables={tables.data} loading={tables.loading} error={tables.error} onReload={() => void tables.reload()} />
        </div>
      </div>

      <section className={styles.diagram} aria-label="Diagrama de la base de datos">
        <div className={styles.diagramHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Diagrama</h2>
            <p className={styles.sectionText}>
              Rueda para acercar o alejar, arrastra el fondo para moverte y las tablas para reubicarlas. Cada tabla muestra sus
              primeras 10 filas. Línea continua = llave foránea declarada; punteada = relación deducida por el nombre de la columna.
            </p>
          </div>
          <Button variant="subtle" size="sm" onClick={() => setLayoutKey((k) => k + 1)}>
            Reorganizar
          </Button>
        </div>
        <SchemaDiagram schema={schema.data} loading={schema.loading} layoutKey={layoutKey} />
      </section>

      <Modal
        open={confirmReset}
        title="¿Restaurar la base de datos?"
        onClose={() => setConfirmReset(false)}
        footer={
          <>
            <Button variant="subtle" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void reset()}>Restaurar</Button>
          </>
        }
      >
        Se borra todo lo del esquema public (incluidas las tablas y vistas que hayas creado) y se vuelve a ejecutar el script del taller.
      </Modal>
    </>
  )
}
