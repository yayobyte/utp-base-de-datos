import { createContext, useContext } from 'react'
import type { Calendario, Persona } from '@/domain/punto1/types'

export interface Punto1ContextValue {
  calendario: Calendario
  persona: Persona
  personas: Persona[]
  /** Recarga calendario y personas (tras avanzar fase, reiniciar, etc.). */
  refresh: () => Promise<void>
}

export const Punto1Context = createContext<Punto1ContextValue | null>(null)

/** Contexto del punto 1: calendario actual y persona suplantada. */
export function usePunto1(): Punto1ContextValue {
  const ctx = useContext(Punto1Context)
  if (!ctx) throw new Error('usePunto1 debe usarse dentro de Punto1Layout')
  return ctx
}
