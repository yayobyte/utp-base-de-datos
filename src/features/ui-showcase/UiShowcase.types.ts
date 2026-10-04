import type { ReactNode } from 'react'

export interface ShowcaseSectionProps {
  title: string
  children: ReactNode
}

export interface SampleRow extends Record<string, unknown> {
  staffNo: string
  name: string
  position: string
  salary: number
  eMail: string | null
}
