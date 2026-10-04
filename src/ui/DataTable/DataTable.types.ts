import type { ReactNode } from 'react'

export type Row = Record<string, unknown>

export interface DataTableColumn<T extends Row = Row> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  highlight?: boolean
  align?: 'left' | 'right'
}

export interface DataTableProps<T extends Row = Row> {
  rows: T[]
  /** Si se omite, las columnas se infieren de las llaves de la primera fila. */
  columns?: DataTableColumn<T>[]
  caption?: string
  emptyMessage?: string
  compact?: boolean
  maxHeight?: 'sm' | 'md' | 'none'
  rowKey?: (row: T, index: number) => string
}
