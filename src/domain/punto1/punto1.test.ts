import { asignar, ordenarPorPrioridad } from './asignacion'
import { puedeCancelar } from './cancelacion'
import { periodoSiguiente, promedioIntegral, siguienteEstado, creditosAprobados } from './cierre'
import { notaFinal, parseNota, validarPorcentajes } from './evaluacion'
import { faseAlcanzada, siguienteFase } from './fases'
import { accionesDe, accionPorId, disponibilidad } from './permisos'
import { opcionesPrematricula, validarSeleccion } from './prematricula'
import type { Asignatura, Calendario, EstudianteResumen, HistorialNota, ProgramacionFranja, Requisito, Solicitud } from './types'

const asig = (cod: string, creditos: number, semestre: number, cupo = 2): Asignatura => ({
  cod_asignatura: cod,
  nombre: cod,
  creditos,
  semestre,
  cupo_maximo_grupo: cupo,
})
const PLAN = [asig('IS101', 4, 1), asig('IS201', 4, 2), asig('IS202', 4, 2), asig('IS301', 4, 3), asig('IS303', 3, 3)]
const REQ: Requisito[] = [
  { cod_asignatura: 'IS201', cod_requisito: 'IS101', tipo: 'prerrequisito' },
  { cod_asignatura: 'IS202', cod_requisito: 'IS101', tipo: 'prerrequisito' },
  { cod_asignatura: 'IS301', cod_requisito: 'IS202', tipo: 'prerrequisito' },
  { cod_asignatura: 'IS303', cod_requisito: 'IS201', tipo: 'prerrequisito' },
  { cod_asignatura: 'IS303', cod_requisito: 'IS301', tipo: 'simultaneidad' },
]
const hist = (id: string, notas: Record<string, number>): HistorialNota[] =>
  Object.entries(notas).map(([cod, n]) => ({ id_estudiante: id, cod_asignatura: cod, periodo: '2025-2', nota_final: n }))

const cal = (fase: Calendario['fase'], extra: Partial<Calendario> = {}): Calendario => ({
  periodo: '2026-2',
  fase,
  semana_actual: 1,
  extemporanea: false,
  aprobado_en: null,
  ...extra,
})

const est = (id: string, en_bloque: boolean, creditos: number, promedio: number): EstudianteResumen => ({
  id_persona: id,
  nombres: id,
  apellidos: '',
  cod_plan: 'P2026',
  estado: 'normal',
  en_bloque,
  promedio_integral: promedio,
  creditos_aprobados: creditos,
  creditos_cursados: creditos,
  periodos_en_prueba: null,
  plan_anterior: null,
  motivo_retiro: null,
  hasta_periodo: null,
})

let nextId = 1
const sol = (id_estudiante: string, cod_asignatura: string, extra: Partial<Solicitud> = {}): Solicitud => ({
  id_solicitud: nextId++,
  periodo: '2026-2',
  id_estudiante,
  cod_asignatura,
  estado: 'pendiente',
  motivo_rechazo: null,
  id_grupo: null,
  semana_cancelacion: null,
  ...extra,
})

describe('fases y permisos', () => {
  it('las fases avanzan en orden y terminan en cierre', () => {
    expect(siguienteFase('planeacion')).toBe('prematricula')
    expect(siguienteFase('cierre')).toBeNull()
    expect(faseAlcanzada('ajustes', 'asignacion')).toBe(true)
  })

  it('cada rol tiene sus acciones', () => {
    expect(accionesDe('administrativo').map((a) => a.id)).toContain('admin-asignacion')
    expect(accionesDe('estudiante')).toHaveLength(6)
    expect(accionesDe('docente')).toHaveLength(4)
  })

  it('las acciones se habilitan solo en su fase, con motivo', () => {
    const pre = accionPorId('est-prematricula')!
    expect(disponibilidad(pre, cal('prematricula'))).toEqual({ ok: true })
    expect(disponibilidad(pre, cal('pago'))).toEqual({ ok: false, motivo: 'Disponible en: Prematrícula' })
  })

  it('el pago en ajustes requiere matrícula extemporánea', () => {
    const pago = accionPorId('est-pago')!
    expect(disponibilidad(pago, cal('ajustes')).ok).toBe(false)
    expect(disponibilidad(pago, cal('ajustes', { extemporanea: true })).ok).toBe(true)
  })
})

describe('prematrícula', () => {
  it('muestra solo lo no aprobado y bloquea por prerrequisitos (nota < 3.0)', () => {
    // Juan: IS202 perdida con 2.5 → no puede ver IS301
    const ops = opcionesPrematricula(PLAN, REQ, hist('E002', { IS101: 3.5, IS201: 3.1, IS202: 2.5 }))
    const byCod = Object.fromEntries(ops.map((o) => [o.asignatura.cod_asignatura, o]))
    expect(byCod.IS101).toBeUndefined()
    expect(byCod.IS202.elegible).toBe(true)
    expect(byCod.IS301).toMatchObject({ elegible: false, motivo: 'Prerrequisito sin aprobar: IS202 (nota 2.5)' })
  })

  it('si la simultaneidad está bloqueada, la asignatura también', () => {
    // Juan: IS301 bloqueada (IS202 = 2.5) → IS303 (exige IS301 simultánea) también
    const ops = opcionesPrematricula(PLAN, REQ, hist('E002', { IS101: 3.5, IS201: 3.1, IS202: 2.5 }))
    expect(ops.find((o) => o.asignatura.cod_asignatura === 'IS303')).toMatchObject({
      elegible: false,
      motivo: 'Requiere cursar IS301 simultáneamente, y no la puedes tomar',
    })
  })

  it('exige cursar la simultaneidad en el mismo periodo', () => {
    const ops = opcionesPrematricula(PLAN, REQ, hist('E001', { IS101: 4.2, IS201: 4.0, IS202: 4.5 }))
    expect(validarSeleccion(['IS303'], ops)).toEqual(['IS303 requiere cursar IS301 simultáneamente'])
    expect(validarSeleccion(['IS303', 'IS301'], ops)).toEqual([])
  })
})

describe('asignación de franjas y grupos', () => {
  it('prioriza en bloque, luego créditos, luego promedio', () => {
    const orden = ordenarPorPrioridad([est('A', false, 20, 4.5), est('B', true, 10, 3.0), est('C', false, 20, 4.8)])
    expect(orden.map((e) => e.id_persona)).toEqual(['B', 'C', 'A'])
  })

  it('llena grupos en orden, evita cruces y registra motivos', () => {
    const prog: ProgramacionFranja[] = [
      { periodo: '2026-2', cod_asignatura: 'IS301', id_franja: 1, max_grupos: 1 },
      { periodo: '2026-2', cod_asignatura: 'IS301', id_franja: 3, max_grupos: 1 },
      { periodo: '2026-2', cod_asignatura: 'IS302', id_franja: 1, max_grupos: 1 },
    ]
    const cupos = new Map([['IS301', 2], ['IS302', 2]])
    const estudiantes = [est('E1', true, 10, 4), est('E2', false, 30, 4), est('E3', false, 20, 4), est('E4', false, 5, 4), est('E5', false, 1, 4)]
    const sols = [
      sol('E1', 'IS301'),
      sol('E2', 'IS301'),
      sol('E3', 'IS301'),
      sol('E4', 'IS301'),
      sol('E5', 'IS301'),
      sol('E2', 'IS302'), // E2 queda en IS301 franja 1 → IS302 (franja 1) choca
    ]
    const r = asignar(estudiantes, sols, prog, cupos)
    expect(r.orden).toEqual(['E1', 'E2', 'E3', 'E4', 'E5'])
    expect(r.grupos).toEqual([
      { cod_asignatura: 'IS301', num_grupo: 1, id_franja: 1 },
      { cod_asignatura: 'IS301', num_grupo: 2, id_franja: 3 },
    ])
    const by = (id: string, cod: string) => r.resultados.find((x) => x.id_solicitud === sols.find((s) => s.id_estudiante === id && s.cod_asignatura === cod)!.id_solicitud)!
    expect(by('E1', 'IS301').grupo?.num_grupo).toBe(1)
    expect(by('E2', 'IS301').grupo?.num_grupo).toBe(1)
    expect(by('E3', 'IS301').grupo?.num_grupo).toBe(2)
    expect(by('E5', 'IS301')).toMatchObject({ asignada: false, motivo: 'Sin cupo en las franjas programadas' })
    expect(by('E2', 'IS302')).toMatchObject({ asignada: false, motivo: 'Cruce de horario con otra asignatura asignada' })
  })

  it('rechaza a los excluidos (no pagaron) y lo no programado', () => {
    const r = asignar([est('E1', false, 1, 4), est('E2', false, 1, 4)], [sol('E1', 'IS301'), sol('E2', 'IS999')], [
      { periodo: '2026-2', cod_asignatura: 'IS301', id_franja: 1, max_grupos: 1 },
    ], new Map([['IS301', 2]]), new Map([['E1', 'No pagó la matrícula']]))
    expect(r.resultados.map((x) => x.motivo)).toEqual(['No pagó la matrícula', 'La asignatura no fue programada este periodo'])
  })
})

describe('cancelación (semana 8)', () => {
  it('libre hasta la semana 8; después, solo una', () => {
    expect(puedeCancelar(8, []).ok).toBe(true)
    expect(puedeCancelar(10, []).ok).toBe(true)
    expect(puedeCancelar(10, [sol('E1', 'IS301', { estado: 'cancelada', semana_cancelacion: 9 })]).ok).toBe(false)
    expect(puedeCancelar(10, [sol('E1', 'IS301', { estado: 'cancelada', semana_cancelacion: 5 })]).ok).toBe(true)
  })
})

describe('evaluación', () => {
  it('máscara de notas 0.0 – 5.0', () => {
    expect(parseNota('3.5')).toEqual({ ok: true, valor: 3.5 })
    expect(parseNota('4,2')).toEqual({ ok: true, valor: 4.2 })
    expect(parseNota('5.5').ok).toBe(false)
    expect(parseNota('abc').ok).toBe(false)
    expect(parseNota('3.55').ok).toBe(false)
  })

  it('porcentajes deben sumar 100', () => {
    expect(validarPorcentajes([{ porcentaje: 30 }, { porcentaje: 70 }])).toBeNull()
    expect(validarPorcentajes([{ porcentaje: 30 }, { porcentaje: 60 }])).toContain('90')
  })

  it('nota final ponderada; componentes sin nota cuentan 0', () => {
    const formas = [
      { id_evaluacion: 1, id_grupo: 1, descripcion: 'P1', porcentaje: 30, fecha: null },
      { id_evaluacion: 2, id_grupo: 1, descripcion: 'P2', porcentaje: 70, fecha: null },
    ]
    expect(notaFinal(formas, [{ id_evaluacion: 1, id_estudiante: 'E1', valor: 4 }, { id_evaluacion: 2, id_estudiante: 'E1', valor: 3 }], 'E1')).toBe(3.3)
    expect(notaFinal(formas, [{ id_evaluacion: 1, id_estudiante: 'E1', valor: 5 }], 'E1')).toBe(1.5)
  })
})

describe('cierre: atributos derivados y matriz de estados', () => {
  it('promedio integral ponderado por créditos (igual que la vista)', () => {
    // E001 del seed: 4.2·4 + 3.8·3 + 4.0·4 + 4.5·4 = 62.2 / 15 = 4.1466 → 4.15
    const notas = [
      { nota_final: 4.2, creditos: 4 },
      { nota_final: 3.8, creditos: 3 },
      { nota_final: 4.0, creditos: 4 },
      { nota_final: 4.5, creditos: 4 },
    ]
    expect(promedioIntegral(notas)).toBe(4.15)
    expect(creditosAprobados([...notas, { nota_final: 2.5, creditos: 4 }])).toBe(15)
  })

  it('transiciones de estado', () => {
    expect(siguienteEstado('normal', 2.8, 0, '2027-1')).toMatchObject({ estado: 'prueba', periodos_en_prueba: 1 })
    expect(siguienteEstado('prueba', 2.9, 1, '2027-1')).toMatchObject({ estado: 'prueba', periodos_en_prueba: 2 })
    expect(siguienteEstado('prueba', 2.9, 2, '2027-1')).toMatchObject({ estado: 'fuera', hasta_periodo: '2027-1' })
    expect(siguienteEstado('prueba', 3.4, 2, '2027-1').estado).toBe('normal')
    expect(siguienteEstado('transicion', 3.6, 0, '2027-1').estado).toBe('normal')
    expect(siguienteEstado('fuera', 4.5, 0, '2027-1').estado).toBe('fuera')
  })

  it('periodo siguiente', () => {
    expect(periodoSiguiente('2026-2')).toBe('2027-1')
    expect(periodoSiguiente('2027-1')).toBe('2027-2')
  })
})

describe('sigueFuera (fuera por un semestre)', () => {
  it('bloquea durante el periodo de la sanción y libera después; sin periodo es definitivo', async () => {
    const { sigueFuera } = await import('./cierre')
    expect(sigueFuera('fuera', '2027-1', '2027-1')).toBe(true)
    expect(sigueFuera('fuera', '2027-1', '2027-2')).toBe(false)
    expect(sigueFuera('fuera', null, '2030-1')).toBe(true)
    expect(sigueFuera('prueba', null, '2027-1')).toBe(false)
  })
})
