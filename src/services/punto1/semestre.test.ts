// @vitest-environment node
import type { PGlite } from '@electric-sql/pglite'
import { p1 } from '@/data'
import { setClientForTesting } from '@/data/clients'
import { migratedDb } from '@/test/pglite'
import { pgliteSupabase } from '@/test/pgliteSupabase'
import { adminService, calendarioActual, docenteService, estudianteService } from '.'

/**
 * Semestre completo, de punta a punta, contra la migración real del punto 1 (PGlite):
 * servicios → repositorios (supabase-js) → SQL. Cada paso depende del anterior.
 */
let db: PGlite

beforeAll(async () => {
  db = await migratedDb('punto-1')
  await db.exec('set role anon')
  vi.stubEnv('VITE_P1_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('VITE_P1_SUPABASE_ANON_KEY', 'sb_publishable_test')
  setClientForTesting('p1', pgliteSupabase(db))
  await adminService.reiniciarDemo()
}, 30_000)

afterAll(async () => {
  setClientForTesting('p1', null)
  vi.unstubAllEnvs()
  await db.close()
})

const fase = async () => (await calendarioActual()).fase
const grupoId = async (cod: string, num: number) => (await p1.grupo.getOne({ cod_asignatura: cod, num_grupo: num })).id_grupo
const estadoSolicitud = async (id: string, cod: string) => (await p1.solicitud.getOne({ id_estudiante: id, cod_asignatura: cod }))

describe('semestre completo (punto 1)', () => {
  it('1. planeación: el calendario debe aprobarse antes de avanzar', async () => {
    expect(await fase()).toBe('planeacion')
    await expect(adminService.avanzarFase()).rejects.toThrow(/aprobar el calendario/)
    await adminService.guardarFranja({ cod_asignatura: 'IS403', id_franja: 4, max_grupos: 1 })
    await adminService.quitarFranja('IS403', 4)
    await adminService.aprobarCalendario()
    expect(await adminService.avanzarFase()).toBe('prematricula')
  })

  it('2. prematrícula: solo asignaturas permitidas por el plan y el reglamento', async () => {
    const juan = await estudianteService.prematricula('E002')
    expect(juan.opciones.find((o) => o.asignatura.cod_asignatura === 'IS301')).toMatchObject({ elegible: false })
    await expect(estudianteService.enviarPrematricula('E002', ['IS301'])).rejects.toThrow(/Prerrequisito sin aprobar: IS202/)
    await expect(estudianteService.enviarPrematricula('E005', ['IS303'])).rejects.toThrow(/simultáneamente/)

    await estudianteService.enviarPrematricula('E001', ['IS301', 'IS302', 'IS303'])
    await estudianteService.enviarPrematricula('E002', ['IS202', 'IS302'])
    // Sofía perdió IS201 (2.8): no puede ver IS302, sí repetir IS201
    await expect(estudianteService.enviarPrematricula('E003', ['IS302'])).rejects.toThrow(/IS201 \(nota 2.8\)/)
    await estudianteService.enviarPrematricula('E003', ['IS201', 'IS301'])
    await estudianteService.enviarPrematricula('E004', ['IS301', 'IS302'])
    await estudianteService.enviarPrematricula('E005', ['IS301', 'IS303'])
    await estudianteService.enviarPrematricula('E006', ['IS401', 'IS402', 'IS403'])
    expect(await p1.solicitud.count()).toBe(14)
    expect(await p1.matricula.count()).toBe(6)
  })

  it('3. pago: todos menos Valentina (E005)', async () => {
    expect(await adminService.avanzarFase()).toBe('pago')
    for (const id of ['E001', 'E002', 'E003', 'E004', 'E006']) await estudianteService.pagar(id)
    await expect(estudianteService.pagar('E001')).rejects.toThrow(/ya está pagada/)
    const m = await estudianteService.matricula('E001')
    expect(m).toMatchObject({ creditos: 10, valor: 1_800_000 })
  })

  it('4. asignación: retira no pagados, prioriza, evita cruces y llena grupos en orden', async () => {
    expect(await adminService.avanzarFase()).toBe('asignacion')
    expect(await adminService.retirarNoPagados()).toBe(1)
    expect(await estadoSolicitud('E005', 'IS301')).toMatchObject({ estado: 'rechazada', motivo_rechazo: 'No pagó la matrícula' })

    const r = await adminService.ejecutarAsignacion()
    expect(r.orden).toEqual(['E001', 'E006', 'E004', 'E002', 'E003'])
    await expect(adminService.ejecutarAsignacion()).rejects.toThrow()

    // IS301: cupo 2 → grupo 1 (lunes 7-9) Ana y Mateo; Sofía al grupo 2 (martes 7-9)
    const g1 = await grupoId('IS301', 1)
    expect((await estadoSolicitud('E001', 'IS301')).id_grupo).toBe(g1)
    expect((await estadoSolicitud('E004', 'IS301')).id_grupo).toBe(g1)
    expect((await estadoSolicitud('E003', 'IS301')).id_grupo).toBe(await grupoId('IS301', 2))
    // IS302 solo en lunes 7-9: cruza con IS301 grupo 1
    expect(await estadoSolicitud('E001', 'IS302')).toMatchObject({ estado: 'rechazada', motivo_rechazo: 'Cruce de horario con otra asignatura asignada' })
    expect((await estadoSolicitud('E002', 'IS302')).estado).toBe('asignada')
    const { grupos } = await adminService.resultadoAsignacion()
    expect(grupos.find((g) => g.cod_asignatura === 'IS301' && g.num_grupo === 1)).toMatchObject({ inscritos: 2, cupo: 2, dia: 'Lunes', hora_inicio: '07:00' })
  })

  it('5. ajustes: docentes sin cruces, ajustes de estudiantes y matrícula extemporánea', async () => {
    expect(await adminService.avanzarFase()).toBe('ajustes')
    await adminService.asignarDocente(await grupoId('IS301', 1), 'D001')
    await adminService.asignarDocente(await grupoId('IS301', 2), 'D001')
    await expect(adminService.asignarDocente(await grupoId('IS302', 1), 'D001')).rejects.toThrow(/misma franja|esa franja/)
    await adminService.asignarDocente(await grupoId('IS302', 1), 'D002')

    const juanIS302 = await estadoSolicitud('E002', 'IS302')
    await estudianteService.retirar('E002', juanIS302.id_solicitud)
    expect((await estadoSolicitud('E002', 'IS302')).estado).toBe('retirada')
    await estudianteService.adicionar('E002', juanIS302.id_grupo!)
    expect((await estadoSolicitud('E002', 'IS302')).estado).toBe('asignada')
    // Ana no puede adicionar IS302: su único grupo cruza con IS301 (lunes 7-9)
    await expect(estudianteService.adicionar('E001', juanIS302.id_grupo!)).rejects.toThrow(/cupo o se cruza/)

    await expect(estudianteService.pagar('E005')).rejects.toThrow(/periodo de pago terminó/)
    await adminService.habilitarExtemporanea(true)
    await estudianteService.pagar('E005')
    expect((await p1.matricula.getOne({ id_estudiante: 'E005' })).estado_pago).toBe('extemporaneo')
  })

  it('6. evaluación: forma de evaluación al 100 %, notas, asistencia y seguimiento de transición', async () => {
    expect(await adminService.avanzarFase()).toBe('evaluacion')
    const g1 = await grupoId('IS301', 1)
    expect((await docenteService.misGrupos('D001')).map((g) => g.num_grupo)).toEqual([1, 2])

    await expect(docenteService.guardarFormas(g1, [{ descripcion: 'P1', porcentaje: 30, fecha: null }, { descripcion: 'P2', porcentaje: 60, fecha: null }])).rejects.toThrow(/90/)
    await docenteService.guardarFormas(g1, [
      { descripcion: 'Parcial 1', porcentaje: 30, fecha: '2026-09-01' },
      { descripcion: 'Parcial 2', porcentaje: 30, fecha: '2026-10-01' },
      { descripcion: 'Final', porcentaje: 40, fecha: '2026-11-20' },
    ])
    const { formas } = await docenteService.planilla(g1)
    for (const [i, v] of [4.5, 4.0, 4.2].entries()) await docenteService.guardarNota(formas[i].id_evaluacion, 'E001', v)
    for (const [i, v] of [2.0, 2.5, 2.0].entries()) await docenteService.guardarNota(formas[i].id_evaluacion, 'E004', v)
    await docenteService.guardarNota(formas[0].id_evaluacion, 'E001', 4.6) // corrección (upsert)
    const planilla = await docenteService.planilla(g1)
    expect(planilla.estudiantes.find((e) => e.id === 'E001')!.final).toBe(4.26)
    expect(planilla.estudiantes.find((e) => e.id === 'E004')!.final).toBe(2.15)
    await expect(docenteService.guardarFormas(g1, [{ descripcion: 'X', porcentaje: 100, fecha: null }])).rejects.toThrow(/Ya hay notas/)

    await docenteService.marcarAsistencia(g1, 'E001', '2026-08-03', true)
    await docenteService.marcarAsistencia(g1, 'E001', '2026-08-03', false)
    expect((await docenteService.asistencia(g1, '2026-08-03')).find((e) => e.id === 'E001')!.asistio).toBe(false)

    expect((await docenteService.seguimiento(g1)).map((e) => e.id)).toEqual(['E004'])
    await docenteService.guardarSeguimiento(g1, 'E004', 4.0, 3.5)
    await expect(docenteService.guardarSeguimiento(g1, 'E001', 4.0, 4.0)).rejects.toThrow(/transición/)
  })

  it('7. cancelación: libre hasta la semana 8, una sola después', async () => {
    await adminService.fijarSemana(9)
    const juan = await estudianteService.horario('E002')
    await estudianteService.cancelar('E002', juan.find((s) => s.cod_asignatura === 'IS302')!.id_solicitud)
    await expect(estudianteService.cancelar('E002', juan.find((s) => s.cod_asignatura === 'IS202')!.id_solicitud)).rejects.toThrow(/única asignatura/)
  })

  it('8. cierre: nota final al historial, atributos derivados y cambio de estado', async () => {
    expect(await adminService.avanzarFase()).toBe('cierre')
    await expect(adminService.avanzarFase()).rejects.toThrow(/cierre/)
    const cambios = await adminService.cerrarSemestre()
    const de = (id: string) => cambios.find((c) => c.id === id)!
    expect(de('E001')).toMatchObject({ antes: 'normal', despues: 'normal' })
    // Mateo (transición): 4.0·4 + 3.6·4 + 3.4·4 + 2.15·4 = 52.6 / 16 = 3.29 → normal
    expect(de('E004')).toMatchObject({ antes: 'transicion', despues: 'normal', promedio: 3.29 })
    // Sofía (prueba 1 periodo) sin notas en IS301 → promedio < 3.0 → prueba, 2 periodos
    expect(de('E003')).toMatchObject({ antes: 'prueba', despues: 'prueba' })
    expect(await p1.resumen.getOne({ id_persona: 'E003' })).toMatchObject({ estado: 'prueba', periodos_en_prueba: 2 })
    expect(await p1.resumen.getOne({ id_persona: 'E004' })).toMatchObject({ estado: 'normal', plan_anterior: null })
    expect(await p1.historial.count({ periodo: '2026-2' })).toBeGreaterThan(0)
  })

  it('9. reiniciar demo restaura el escenario', async () => {
    await adminService.reiniciarDemo()
    expect(await fase()).toBe('planeacion')
    expect(await p1.solicitud.count()).toBe(0)
    expect((await p1.resumen.getOne({ id_persona: 'E004' })).estado).toBe('transicion')
  })
})
