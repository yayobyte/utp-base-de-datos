import styles from './Stepper.module.css'
import type { StepperProps } from './Stepper.types'

export function Stepper({ steps, current, onSelect }: StepperProps) {
  return (
    <ol className={styles.stepper}>
      {steps.map((step, i) => {
        const state = i < current ? styles.done : i === current ? styles.current : styles.pending
        return (
          <li key={step.id} className={[styles.step, state].join(' ')}>
            <button
              type="button"
              className={styles.button}
              onClick={() => onSelect?.(i)}
              disabled={!onSelect}
              aria-current={i === current ? 'step' : undefined}
            >
              <span className={styles.dot}>{i < current ? '✓' : i + 1}</span>
              <span className={styles.text}>
                <span className={styles.label}>{step.label}</span>
                {step.description && <span className={styles.description}>{step.description}</span>}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
