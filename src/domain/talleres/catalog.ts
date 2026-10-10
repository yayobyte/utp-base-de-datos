import dreamhomeSql from '../../../curso/docs/taller-joins/taller-join-dreamhome.sql?raw'
import joinsSolucionSql from '../../../curso/docs/taller-joins/taller-joins-solucion.sql?raw'
import joinsSql from '../../../curso/docs/taller-joins/taller-joins.sql?raw'
import { parseExercises, type TallerExercise } from './exercises'

export type TallerId = 'joins' | 'dreamhome'

export interface Taller {
  id: TallerId
  path: string
  title: string
  shortLabel: string
  summary: string
  /** Script que crea las tablas y carga los datos (se ejecuta una vez y al restaurar). */
  setupSql: string
  /** Archivo del script en el repositorio (para mostrarlo). */
  setupFile: string
  exercises: TallerExercise[]
  /** Consulta con la que arranca la consola. */
  initialQuery: string
}

/** Talleres de clase con base de datos propia. Fuente única para la navegación y las páginas. */
export const TALLERES: Taller[] = [
  {
    id: 'joins',
    path: '/talleres/joins',
    title: 'Taller JOINs — dbbook',
    shortLabel: 'JOINs',
    summary:
      'Tablas del libro de Ramakrishnan & Gehrke: universidad, empresa, aerolínea, proveedores y marineros. Incluye las consultas a–n del taller.',
    setupSql: joinsSql,
    setupFile: 'curso/docs/taller-joins/taller-joins.sql',
    exercises: parseExercises(joinsSolucionSql),
    initialQuery: 'SELECT * FROM student;',
  },
  {
    id: 'dreamhome',
    path: '/talleres/dreamhome',
    title: 'Taller DreamHome',
    shortLabel: 'DreamHome',
    summary: 'Inmobiliaria DreamHome: sucursales, personal, clientes, propiedades, visitas, registros y contratos.',
    setupSql: dreamhomeSql,
    setupFile: 'curso/docs/taller-joins/taller-join-dreamhome.sql',
    exercises: [],
    initialQuery: 'SELECT * FROM staff;',
  },
]

export const findTaller = (id: string | undefined): Taller | undefined => TALLERES.find((t) => t.id === id)
