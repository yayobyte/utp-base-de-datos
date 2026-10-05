import { DataError, p1, p1Rpc } from '@/data'
import type { Calendario, Persona } from '@/domain/punto1/types'

/** Periodo académico activo (el único calendario de la demo). */
export async function calendarioActual(): Promise<Calendario> {
  const [cal] = await p1.calendario.findAll({ orderBy: { column: 'periodo', ascending: false }, limit: 1 })
  if (!cal) throw new DataError('No hay calendario académico configurado', 'not_found')
  return cal
}

/** Personas que se pueden suplantar, por rol y nombre. */
export function personas(): Promise<Persona[]> {
  return p1.persona.findAll({ orderBy: [{ column: 'rol' }, { column: 'id_persona' }] })
}

export const reiniciarDemo = () => p1Rpc.reiniciarDemo()
