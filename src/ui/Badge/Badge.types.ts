import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'strong' | 'outline' | 'success' | 'warning' | 'danger'

export interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}
