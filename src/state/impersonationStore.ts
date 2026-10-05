import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ImpersonationState {
  /** Persona que se está suplantando en el punto 1 (sin autenticación real). */
  personaId: string | null
  impersonate: (id: string | null) => void
}

/** Se guarda en localStorage para que la suplantación sobreviva a recargas. */
export const useImpersonationStore = create<ImpersonationState>()(
  persist(
    (set) => ({
      personaId: null,
      impersonate: (personaId) => set({ personaId }),
    }),
    { name: 'punto1-persona' },
  ),
)
