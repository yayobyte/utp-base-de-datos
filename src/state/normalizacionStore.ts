import { create } from 'zustand'
import { PRESTAMO_ORIGINAL, type PrestamoRow } from '@/domain/punto3/normalizacion'

export const STEP_COUNT = 4

interface NormalizacionState {
  /** Paso actual: 0 = 0FN … 3 = 3FN. */
  step: number
  /** Filas de origen (editables en modo sandbox). */
  rows: PrestamoRow[]
  setStep: (step: number) => void
  next: () => void
  prev: () => void
  updateCell: (index: number, field: keyof PrestamoRow, value: string) => void
  /** Vuelve a los datos del enunciado. */
  resetRows: () => void
  edited: () => boolean
}

const clampStep = (n: number) => Math.min(Math.max(n, 0), STEP_COUNT - 1)

/** Estado del punto 3: solo frontend, sin base de datos. */
export const useNormalizacionStore = create<NormalizacionState>((set, get) => ({
  step: 0,
  rows: PRESTAMO_ORIGINAL,
  setStep: (step) => set({ step: clampStep(step) }),
  next: () => set((s) => ({ step: clampStep(s.step + 1) })),
  prev: () => set((s) => ({ step: clampStep(s.step - 1) })),
  updateCell: (index, field, value) =>
    set((s) => ({ rows: s.rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)) })),
  resetRows: () => set({ rows: PRESTAMO_ORIGINAL }),
  edited: () => get().rows !== PRESTAMO_ORIGINAL,
}))
