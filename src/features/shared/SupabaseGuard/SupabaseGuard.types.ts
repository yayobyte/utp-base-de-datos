import type { ReactNode } from 'react'
import type { ProjectId } from '@/data'

export interface SupabaseGuardProps {
  project: ProjectId
  children: ReactNode
}
