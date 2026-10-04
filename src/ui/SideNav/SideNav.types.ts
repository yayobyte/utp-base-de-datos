import type { ReactNode } from 'react'

export interface SideNavItem {
  id: string
  label: string
  description?: string
  badge?: ReactNode
  disabled?: boolean
  disabledReason?: string
}

export interface SideNavSection {
  title?: string
  items: SideNavItem[]
}

export interface SideNavProps {
  sections: SideNavSection[]
  activeId?: string
  onSelect: (id: string) => void
  ariaLabel?: string
}
