import type { NfStep } from '@/domain/punto3/normalizacion'

export interface StepViewProps {
  step: NfStep
  /** Paso anterior, para mostrar el «antes» junto al «después». */
  previous?: NfStep
}
