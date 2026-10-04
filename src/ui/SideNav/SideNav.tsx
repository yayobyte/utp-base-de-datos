import styles from './SideNav.module.css'
import type { SideNavProps } from './SideNav.types'

export function SideNav({ sections, activeId, onSelect, ariaLabel }: SideNavProps) {
  return (
    <nav aria-label={ariaLabel} className={styles.nav}>
      {sections.map((section, i) => (
        <div key={section.title ?? i} className={styles.section}>
          {section.title && <p className={styles.title}>{section.title}</p>}
          <ul className={styles.list}>
            {section.items.map((item) => {
              const active = item.id === activeId
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={[styles.row, active && styles.active].filter(Boolean).join(' ')}
                    aria-current={active ? 'page' : undefined}
                    disabled={item.disabled}
                    title={item.disabled ? item.disabledReason : undefined}
                    onClick={() => onSelect(item.id)}
                  >
                    <span className={styles.text}>
                      <span className={styles.label}>{item.label}</span>
                      {(item.disabled ? item.disabledReason : item.description) && (
                        <span className={styles.description}>{item.disabled ? item.disabledReason : item.description}</span>
                      )}
                    </span>
                    {item.badge}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
