import { useState, type KeyboardEvent } from 'react'
import { DataError, type SqlResult } from '@/data'
import { Button, Card, Chip, TextArea } from '@/ui'
import { ResultView } from '../ResultView/ResultView'
import styles from './SqlConsole.module.css'
import type { SqlConsoleProps } from './SqlConsole.types'

const HISTORY_SIZE = 10

const preview = (script: string) => {
  const line = script.replace(/\s+/g, ' ').trim()
  return line.length > 40 ? `${line.slice(0, 40)}…` : line
}

/** Consola SQL real (punto 2 y talleres). Ctrl/⌘ + Enter ejecuta. */
export function SqlConsole({
  value,
  onChange,
  onRun,
  subtitle = 'PostgreSQL real · esquema examen · Ctrl/⌘ + Enter',
  inputHint = "Varias sentencias: termina cada una con ';' al final de la línea. Solo SELECT, WITH, INSERT, UPDATE y DELETE.",
  placeholder = 'SELECT * FROM dvd;',
}: SqlConsoleProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SqlResult>()
  const [error, setError] = useState<DataError>()
  const [history, setHistory] = useState<string[]>([])

  const run = async () => {
    const script = value.trim()
    if (!script || loading) return
    setLoading(true)
    setError(undefined)
    try {
      setResult(await onRun(script))
    } catch (e) {
      setResult(undefined)
      setError(DataError.from(e))
    } finally {
      setLoading(false)
      setHistory((h) => [script, ...h.filter((s) => s !== script)].slice(0, HISTORY_SIZE))
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      void run()
    }
  }

  return (
    <Card as="section" variant="soft" className={styles.console} id="consola">
      <div className={styles.header}>
        <h2 className={styles.title}>Consola SQL</h2>
        <span className={styles.hint}>{subtitle}</span>
      </div>

      <TextArea
        label="Consulta"
        monospace
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        hint={inputHint}
      />

      <div className={styles.actions}>
        <Button onClick={() => void run()} loading={loading} disabled={!value.trim()}>
          Ejecutar
        </Button>
        <Button variant="subtle" onClick={() => onChange('')} disabled={!value}>
          Limpiar
        </Button>
      </div>

      {history.length > 0 && (
        <div className={styles.history} aria-label="Historial">
          <span className={styles.hint}>Historial</span>
          <div className={styles.chips}>
            {history.map((h) => (
              <Chip key={h} title={h} onClick={() => onChange(h)}>
                {preview(h)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <ResultView result={result} error={error} loading={loading} idleMessage="Escribe una consulta y pulsa Ejecutar." />
    </Card>
  )
}
