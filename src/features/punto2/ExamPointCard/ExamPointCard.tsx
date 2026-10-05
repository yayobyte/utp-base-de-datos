import { useState } from 'react'
import { DataError, type SqlResult } from '@/data'
import { toScript } from '@/domain/punto2/examQueries'
import { Badge, Button, CodeBlock, Modal } from '@/ui'
import { ResultView } from '../ResultView/ResultView'
import styles from './ExamPointCard.module.css'
import type { ExamPointCardProps } from './ExamPointCard.types'

/** Pregunta del examen plegada: al abrirla muestra su SQL (con la pregunta como comentario) y se puede ejecutar. */
export function ExamPointCard({ query, onRun, onOpenInConsole }: ExamPointCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SqlResult>()
  const [error, setError] = useState<DataError>()

  const run = async () => {
    setConfirming(false)
    setLoading(true)
    setError(undefined)
    try {
      setResult(await onRun(query))
    } catch (e) {
      setResult(undefined)
      setError(DataError.from(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <details className={styles.card} id={`punto-${query.id}`}>
      <summary className={styles.summary}>
        <span className={styles.letter}>{query.id}</span>
        <span className={styles.question}>{query.question}</span>
        {query.mutates && <Badge tone="warning">Modifica datos</Badge>}
      </summary>

      <div className={styles.body}>
        <CodeBlock code={toScript(query)} title={`Punto ${query.id}`} />

        <div className={styles.actions}>
          <Button onClick={() => (query.mutates ? setConfirming(true) : void run())} loading={loading}>
            Ejecutar
          </Button>
          <Button variant="subtle" onClick={() => onOpenInConsole(query)}>
            Abrir en la consola
          </Button>
        </div>

        {(result || error || loading) && <ResultView result={result} error={error} loading={loading} />}
      </div>

      <Modal
        open={confirming}
        title={`¿Ejecutar el punto ${query.id}?`}
        onClose={() => setConfirming(false)}
        footer={
          <>
            <Button variant="subtle" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void run()}>Ejecutar</Button>
          </>
        }
      >
        Esta consulta modifica los datos de la base. Puedes volver al estado original con «Restablecer datos».
      </Modal>
    </details>
  )
}
