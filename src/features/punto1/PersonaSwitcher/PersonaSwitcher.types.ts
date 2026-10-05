import type { Persona } from '@/domain/punto1/types'

export interface PersonaSwitcherProps {
  personas: Persona[]
  activeId: string | null
  onSelect: (id: string) => void
}
