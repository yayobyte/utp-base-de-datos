import { useEffect, useMemo } from 'react'
import { normalize } from '@/domain/punto3/normalizacion'
import { EXAM_POINTS } from '@/layout/navigation'
import { SectionHeader } from '@/layout/SectionHeader/SectionHeader'
import { STEP_COUNT, useNormalizacionStore } from '@/state/normalizacionStore'
import { Button, Stepper } from '@/ui'
import { SourceEditor } from '../SourceEditor/SourceEditor'
import { StepView } from '../StepView/StepView'
import styles from './Punto3Page.module.css'
import type { Punto3PageProps } from './Punto3Page.types'

const POINT = EXAM_POINTS.find((p) => p.id === 'punto-3')!

const DESCRIPTIONS = ['Tabla original', 'Valores atómicos', 'Sin dep. parciales', 'Sin dep. transitivas']

/** Punto 3: normalización paso a paso de la tabla Préstamo. Solo estado en el frontend (Zustand). */
export function Punto3Page({ initialStep }: Punto3PageProps) {
  const { step, rows, setStep, next, prev, updateCell, resetRows } = useNormalizacionStore()
  const edited = useNormalizacionStore((s) => s.edited())
  const steps = useMemo(() => normalize(rows), [rows])

  useEffect(() => {
    if (initialStep !== undefined) setStep(initialStep)
  }, [initialStep, setStep])

  const current = steps[step]

  return (
    <>
      <SectionHeader
        eyebrow={`Punto ${POINT.number} · ${POINT.shortLabel}`}
        title={POINT.title}
        description="Normalización de la tabla Préstamo hasta 3FN. Cada paso muestra las dependencias funcionales, qué cambia y cómo quedan las tablas."
      />

      <div className={styles.controls}>
        <Stepper
          current={step}
          onSelect={setStep}
          steps={steps.map((s, i) => ({ id: s.id, label: s.label, description: DESCRIPTIONS[i] }))}
        />
        <div className={styles.nav}>
          <Button variant="subtle" onClick={prev} disabled={step === 0}>
            ← Anterior
          </Button>
          <Button onClick={next} disabled={step === STEP_COUNT - 1}>
            Siguiente →
          </Button>
        </div>
      </div>

      <StepView step={current} previous={step > 0 ? steps[step - 1] : undefined} />

      <div className={styles.sandbox}>
        <SourceEditor rows={rows} edited={edited} onChange={updateCell} onReset={resetRows} />
      </div>
    </>
  )
}
