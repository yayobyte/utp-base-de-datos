const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** Ordena bloques de horario por día y hora. */
export function ordenarHorario<T extends { dia: string | null; hora_inicio: string | null }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => DIAS.indexOf(a.dia ?? '') - DIAS.indexOf(b.dia ?? '') || (a.hora_inicio ?? '').localeCompare(b.hora_inicio ?? ''),
  )
}

export const franjaTexto = (f: { dia: string | null; hora_inicio: string | null; hora_fin: string | null }) =>
  f.dia ? `${f.dia} ${f.hora_inicio?.slice(0, 5)}–${f.hora_fin?.slice(0, 5)}` : '—'
