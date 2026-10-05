import type { Rol } from '@/domain/punto1/types'
import { Chip } from '@/ui'
import styles from './PersonaSwitcher.module.css'
import type { PersonaSwitcherProps } from './PersonaSwitcher.types'

const GRUPOS: { rol: Rol; label: string }[] = [
  { rol: 'administrativo', label: 'Admin / Registro' },
  { rol: 'docente', label: 'Docentes' },
  { rol: 'estudiante', label: 'Estudiantes' },
]

/** Suplantación con un clic: una píldora por persona, agrupadas por rol. */
export function PersonaSwitcher({ personas, activeId, onSelect }: PersonaSwitcherProps) {
  return (
    <div className={styles.switcher} role="group" aria-label="Actuar como">
      <span className={styles.label}>Actuar como</span>
      {GRUPOS.map((g) => (
        <div key={g.rol} className={styles.group}>
          <span className={styles.groupLabel}>{g.label}</span>
          <div className={styles.chips}>
            {personas
              .filter((p) => p.rol === g.rol)
              .map((p) => (
                <Chip key={p.id_persona} selected={p.id_persona === activeId} onClick={() => onSelect(p.id_persona)} title={p.email}>
                  {p.nombres} {p.apellidos}
                </Chip>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
