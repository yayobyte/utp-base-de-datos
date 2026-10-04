import styles from './Tabs.module.css'
import type { TabsProps } from './Tabs.types'

export function Tabs({ items, value, onChange, ariaLabel }: TabsProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={styles.tabs}>
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={item.disabled}
            className={[styles.tab, active && styles.active].filter(Boolean).join(' ')}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
