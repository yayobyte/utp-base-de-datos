import { useEffect } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { docenteService } from '@/services/punto1'
import { Select } from '@/ui'
import { usePunto1 } from '../../context'
import styles from './GroupPicker.module.css'
import type { GroupPickerProps } from './GroupPicker.types'

/** Selector de los grupos del docente suplantado. Elige el primero automáticamente. */
export function GroupPicker({ value, onChange }: GroupPickerProps) {
  const { persona } = usePunto1()
  const { data, loading } = useAsync(() => docenteService.misGrupos(persona.id_persona), [persona.id_persona])

  useEffect(() => {
    if (data?.length && !data.some((g) => g.id_grupo === value)) onChange(data[0].id_grupo, data[0])
  }, [data, value, onChange])

  if (loading && !data) return <p className={styles.muted}>Cargando grupos…</p>
  if (!data?.length) return <p className={styles.muted}>No tienes grupos asignados. El Admin los asigna en «Docentes».</p>

  return (
    <Select
      label="Grupo"
      value={value ? String(value) : ''}
      onChange={(e) => {
        const g = data.find((x) => x.id_grupo === Number(e.target.value))!
        onChange(g.id_grupo, g)
      }}
      options={data.map((g) => ({ value: String(g.id_grupo), label: `${g.cod_asignatura} · ${g.asignatura} · G${g.num_grupo} (${g.dia} ${g.hora_inicio}) · ${g.inscritos} estudiantes` }))}
    />
  )
}
