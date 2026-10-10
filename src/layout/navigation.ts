export interface ExamPoint {
  id: 'punto-1' | 'punto-2' | 'punto-3'
  path: string
  number: number
  shortLabel: string
  title: string
  summary: string
  cta: string
}

/** Los tres puntos del examen (docs/examen/exam.md). Fuente única para la navegación y el inicio. */
export const EXAM_POINTS: ExamPoint[] = [
  {
    id: 'punto-1',
    path: '/punto-1',
    number: 1,
    shortLabel: 'Modelado E-ER',
    title: 'Registro de notas UTP',
    summary:
      'Modelo E-ER convertido en sistema: suplanta a un estudiante, docente o admin y recorre el calendario académico completo.',
    cta: 'Abrir sistema',
  },
  {
    id: 'punto-2',
    path: '/punto-2',
    number: 2,
    shortLabel: 'Consultas SQL',
    title: 'Películas, actores y alquileres',
    summary: 'Todas las tablas a la vista, consola SQL real y las respuestas a–e ejecutables paso a paso.',
    cta: 'Ver consultas',
  },
  {
    id: 'punto-3',
    path: '/punto-3',
    number: 3,
    shortLabel: 'Normalización',
    title: 'Tabla Préstamo',
    summary: 'Paso a paso de 0FN a 3FN: dependencias funcionales, tablas resultantes y explicación de cada cambio.',
    cta: 'Ver normalización',
  },
]

/** Talleres de clase: sección aparte de los puntos del examen (ver domain/talleres/catalog). */
export const TALLERES_PATH = '/talleres'
