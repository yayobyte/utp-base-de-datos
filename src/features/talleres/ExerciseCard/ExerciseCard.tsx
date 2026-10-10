import { useState } from 'react'
import { DataError, type SqlResult } from '@/data'
import { ResultView } from '@/features/punto2/ResultView/ResultView'
import { Button, CodeBlock } from '@/ui'
import styles from './ExerciseCard.module.css'
import type { ExerciseCardProps } from './ExerciseCard.types'

/** Ejercicio del taller plegado: muestra su SQL y se puede ejecutar o copiar a la consola. */
export function ExerciseCard({ exercise, onRun, onOpenInConsole }: ExerciseCardProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SqlResult>()
  const [error, setError] = useState<DataError>()

  const run = async () => {
    setLoading(true)
    setError(undefined)
    try {
      setResult(await onRun(exercise))
    } catch (e) {
      setResult(undefined)
      setError(DataError.from(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <details className={styles.card} id={exercise.id}>
      <summary className={styles.summary}>{exercise.title}</summary>
      <div className={styles.body}>
        {exercise.notes.length > 0 && <p className={styles.notes}>{exercise.notes.join(' ')}</p>}
        <CodeBlock code={exercise.sql} language="sql" />
        <div className={styles.actions}>
          <Button onClick={() => void run()} loading={loading}>
            Ejecutar
          </Button>
          <Button variant="subtle" onClick={() => onOpenInConsole(exercise)}>
            Abrir en la consola
          </Button>
        </div>
        {(result || error || loading) && <ResultView result={result} error={error} loading={loading} />}
      </div>
    </details>
  )
}
