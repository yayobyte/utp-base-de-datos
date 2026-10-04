import type { HTMLAttributes } from 'react'

export type CardVariant = 'content' | 'elevated' | 'soft' | 'dark'
export type CardPadding = 'md' | 'lg' | 'xl'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  as?: 'div' | 'section' | 'article'
}
