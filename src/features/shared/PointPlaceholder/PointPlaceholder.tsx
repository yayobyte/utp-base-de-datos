import { SectionHeader } from '@/layout/SectionHeader/SectionHeader'
import { EmptyState } from '@/ui'
import type { PointPlaceholderProps } from './PointPlaceholder.types'

/** Página provisional de cada punto mientras se implementa su fase del plan. */
export function PointPlaceholder({ point, phase }: PointPlaceholderProps) {
  return (
    <>
      <SectionHeader eyebrow={`Punto ${point.number} · ${point.shortLabel}`} title={point.title} description={point.summary} />
      <EmptyState icon="⏳" title="En construcción" description={`Se implementa en la fase ${phase} de docs/PLAN.md.`} />
    </>
  )
}
