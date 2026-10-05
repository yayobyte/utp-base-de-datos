import type { ReactNode } from 'react'
import type { Rol } from '@/domain/punto1/types'
import { AvatarButton } from '@/ui'
import styles from './PersonaSwitcher.module.css'
import type { PersonaSwitcherProps } from './PersonaSwitcher.types'

/** Íconos de rol (trazo simple, color del texto). */
const ICONOS: Record<Rol, ReactNode> = {
  administrativo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
    </svg>
  ),
  docente: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v11H4zM8 20h8M12 16v4" />
    </svg>
  ),
  estudiante: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5-10-5zM6 11v5c3 2 9 2 12 0v-5" />
    </svg>
  ),
}

const GRUPOS: { rol: Rol; label: string }[] = [
  { rol: 'administrativo', label: 'Admin / Registro' },
  { rol: 'docente', label: 'Docentes' },
  { rol: 'estudiante', label: 'Estudiantes' },
]

/** Suplantación con un clic: un avatar por persona, agrupados por rol. */
export function PersonaSwitcher({ personas, activeId, onSelect }: PersonaSwitcherProps) {
  return (
    <div className={styles.switcher} role="group" aria-label="Actuar como">
      <span className={styles.label}>Actuar como</span>
      {GRUPOS.map((g) => (
        <div key={g.rol} className={styles.group}>
          <span className={styles.groupLabel}>
            <span className={styles.groupIcon}>{ICONOS[g.rol]}</span>
            {g.label}
          </span>
          <div className={styles.avatars}>
            {personas
              .filter((p) => p.rol === g.rol)
              .map((p) => (
                <AvatarButton
                  key={p.id_persona}
                  name={`${p.nombres} ${p.apellidos}`}
                  badge={ICONOS[p.rol]}
                  selected={p.id_persona === activeId}
                  title={`${p.nombres} ${p.apellidos} · ${p.id_persona} · ${p.email}`}
                  onClick={() => onSelect(p.id_persona)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
