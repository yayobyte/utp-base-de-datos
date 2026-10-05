/**
 * Respuestas del punto 2 del examen (docs/examen/exam.md, docs/especificacion-punto-2.md).
 * Datos puros: la UI los muestra y los ejecuta con data/punto2/sqlRunner.
 */

export type ExamPointId = 'a' | 'b' | 'c' | 'd' | 'e'

export interface ExamQuery {
  id: ExamPointId
  question: string
  /** Sentencias en orden; se ejecutan en una sola transacción. Se muestra el resultado de la última. */
  statements: string[]
  explanation: string
  /** Qué debe verse al ejecutar (para comprobarlo en la presentación). */
  expected: string
  /** Modifica datos: pide confirmación y ofrece "Restablecer datos". */
  mutates: boolean
}

export const EXAM_QUERIES: ExamQuery[] = [
  {
    id: 'a',
    question: 'Listar las películas en DVD con sus actores y, por cada actor, el personaje (character) que interpreta.',
    statements: [
      `SELECT d.title, a.actorName, da.character
  FROM dvd d
  JOIN dvdactor da ON da.catalogNo = d.catalogNo
  JOIN actor a     ON a.actorNo    = da.actorNo
 ORDER BY d.title, a.actorName`,
    ],
    explanation:
      'DVDActor es la tabla que une películas y actores (relación M:N). Se hace JOIN de DVD con DVDActor por catalogNo y de DVDActor con Actor por actorNo; el personaje está en la tabla intermedia.',
    expected: '7 filas: Lord of the Rings III aparece dos veces (Elijah Wood – Frodo Baggins, Ian McKellen – Gandalf).',
    mutates: false,
  },
  {
    id: 'b',
    question: '¿Cuáles son las películas que se encuentran alquiladas, cuáles no se han devuelto y quién las alquiló?',
    statements: [
      `SELECT d.title, c.dvdNo,
       m.mFName || ' ' || m.mLName AS alquilado_por,
       al.fechaSalida, r.fechaEntrega,
       CASE WHEN r.fechaEntrega IS NULL THEN 'No devuelta' ELSE 'Devuelta' END AS estado
  FROM alquiler al
  JOIN member m    ON m.memberNo   = al.memberNo
  JOIN dvdrental r ON r.deliveryNo = al.deliveryNo
  JOIN dvdcopy c   ON c.dvdNo      = r.dvdNo
  JOIN dvd d       ON d.catalogNo  = c.catalogNo
 ORDER BY estado DESC, d.title`,
    ],
    explanation:
      'Alquiler dice quién y cuándo; DVDRental dice qué copia y cuándo se devolvió (FechaEntrega); DVDCopy lleva de la copia a la película. Una FechaEntrega NULL significa que la copia sigue alquilada.',
    expected: '4 alquileres; 1 sin devolver: War of the Worlds (copia 17864331), alquilada por Serena Parker.',
    mutates: false,
  },
  {
    id: 'c',
    question: '¿Cuánto gana la empresa al mes?',
    statements: [
      `SELECT SUM(t.cargoMes) AS ingreso_mensual
  FROM member m
  JOIN tipomembrecia t ON t.mTypeNo = m.mTypeNo`,
    ],
    explanation:
      'Cada miembro paga el cargo mensual de su tipo de membresía. Se une Member con TipoMembrecia y se suma CargoMes.',
    expected: '51.96 (14.99 + 14.99 + 11.99 + 9.99).',
    mutates: false,
  },
  {
    id: 'd',
    question: 'Habeas data: el miembro Serena Parker solicitó que toda su información fuera eliminada. Realizar este proceso.',
    statements: [
      `DELETE FROM deseo
 WHERE memberNo IN (SELECT memberNo FROM member WHERE mFName = 'Serena' AND mLName = 'Parker')`,
      `DELETE FROM dvdrental
 WHERE deliveryNo IN (SELECT deliveryNo FROM alquiler
                       WHERE memberNo IN (SELECT memberNo FROM member
                                           WHERE mFName = 'Serena' AND mLName = 'Parker'))`,
      `DELETE FROM alquiler
 WHERE memberNo IN (SELECT memberNo FROM member WHERE mFName = 'Serena' AND mLName = 'Parker')`,
      `DELETE FROM member WHERE mFName = 'Serena' AND mLName = 'Parker'`,
      `SELECT memberNo, mFName, mLName FROM member ORDER BY memberNo`,
    ],
    explanation:
      'Primero se borran los registros que dependen del miembro (lista de deseos, detalle de alquiler y alquileres) y al final el miembro. Aunque no hay llaves foráneas, este orden evita dejar datos huérfanos. Las 4 sentencias van en una sola transacción.',
    expected: 'Quedan 3 miembros (sin M115656). Deseo y Alquiler ya no tienen filas de Serena.',
    mutates: true,
  },
  {
    id: 'e',
    question:
      'Subir el sueldo: 2 % a quienes ganan más que el promedio y 3 % a quienes ganan menos. Actualizar la tabla respectiva.',
    statements: [
      `UPDATE staff
   SET salary = CASE
                  WHEN salary > (SELECT AVG(salary) FROM staff) THEN salary * 1.02
                  ELSE salary * 1.03
                END`,
      `SELECT staffNo, name, salary FROM staff ORDER BY staffNo`,
    ],
    explanation:
      'La subconsulta AVG(salary) se evalúa con los valores anteriores al UPDATE (la sentencia ve una sola foto de la tabla), así que todos se comparan contra el mismo promedio: 42 000.',
    expected: 'Promedio 42 000. Art Peters (S0415) gana justo el promedio → 3 % → 43 260. Mary Martinez → 52 020.',
    mutates: true,
  },
]

/** Script de una pregunta, tal como se pega en la consola SQL. */
export function toScript(query: ExamQuery): string {
  return query.statements.map((s) => `${s};`).join('\n\n')
}

/** Llamada equivalente con supabase-js (así la ejecuta la app). */
export function toSupabaseJs(query: ExamQuery): string {
  const list = query.statements.map((s) => `    \`${s.replace(/`/g, '\\`')}\``).join(',\n')
  return `const { data, error } = await supabase.rpc('run_sql', {\n  statements: [\n${list},\n  ],\n})\n// data → { rows: [...], rowCount }`
}
