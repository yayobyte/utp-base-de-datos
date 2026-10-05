import { useState } from 'react'
import { DataError, type SqlResult } from '@/data'
import { toScript, toSupabaseJs } from '@/domain/punto2/examQueries'
import { Badge, Button, Card, CodeBlock, Modal, Tabs } from '@/ui'
import { ResultView } from '../ResultView/ResultView'
import styles from './ExamPointCard.module.css'
import type { ExamPointCardProps, ExamPointTab } from './ExamPointCard.types'

const TABS = [
  { id: 'sql', label: 'SQL' },
  { id: 'js', label: 'supabase-js' },
  { id: 'explicacion', label: 'Explicación' },
]

export function ExamPointCard({ query, onRun, onOpenInConsole }: ExamPointCardProps) {
  const [tab, setTab] = useState<ExamPointTab>('sql')
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
    <Card as="article" variant="content" className={styles.card} id={`punto-${query.id}`}>
      <header className={styles.header}>
        <span className={styles.letter}>{query.id}</span>
        <div className={styles.headText}>
          <h3 className={styles.question}>{query.question}</h3>
          {query.mutates && <Badge tone="warning">Modifica datos</Badge>}
        </div>
      </header>

      <Tabs ariaLabel={`Detalle del punto ${query.id}`} items={TABS} value={tab} onChange={(id) => setTab(id as ExamPointTab)} />

      {tab === 'sql' && <CodeBlock code={toScript(query)} title={`Punto ${query.id} · SQL`} />}
      {tab === 'js' && <CodeBlock code={toSupabaseJs(query)} language="ts" title="supabase-js" />}
      {tab === 'explicacion' && (
        <div className={styles.explanation}>
          <p>{query.explanation}</p>
          <p>
            <strong>Resultado esperado:</strong> {query.expected}
          </p>
        </div>
      )}

      <div className={styles.actions}>
        <Button onClick={() => (query.mutates ? setConfirming(true) : void run())} loading={loading}>
          Ejecutar
        </Button>
        <Button variant="subtle" onClick={() => onOpenInConsole(query)}>
          Abrir en la consola
        </Button>
      </div>

      <ResultView result={result} error={error} loading={loading} />

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
    </Card>
  )
}
