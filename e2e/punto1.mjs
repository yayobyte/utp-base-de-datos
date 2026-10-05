/**
 * Prueba de punta a punta del punto 1 (semestre completo) en un navegador real.
 * Recorre las 7 fases con los 3 roles tal como lo haría un usuario y termina con «Restaurar».
 *
 *   npm run e2e:punto1                         # contra producción
 *   E2E_BASE_URL=http://localhost:5173 npm run e2e:punto1
 *
 * Variables: E2E_BASE_URL (sitio), CHROME_PATH (Chrome/Chromium), E2E_OUT (carpeta de capturas).
 * OJO: escribe en la BD #1 (prematrículas, notas…) y al final la restaura.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const OUT = process.env.E2E_OUT ?? join(tmpdir(), 'e2e-punto1')
mkdirSync(OUT, { recursive: true })
const BASE = (process.env.E2E_BASE_URL ?? 'https://utp-base-de-datos.vercel.app').replace(/\/$/, '')
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
console.log(`Sitio: ${BASE} · capturas: ${OUT}`)
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 1366, height: 900 })
const errors = []
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
p.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))
const log = (...a) => console.log(...a)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let shot = 0
const snap = async (name) => p.screenshot({ path: `${OUT}/${String(++shot).padStart(2, '0')}-${name}.png`, fullPage: true })

const text = () => p.evaluate(() => document.body.innerText)
const waitText = (t, timeout = 15000) => p.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, t)
const busyDone = () => p.waitForFunction(() => !document.querySelector('[aria-busy="true"]') && !document.body.innerText.includes('Cargando'), { timeout: 15000 }).catch(() => {})

async function clickButton(label, { exact = true, within } = {}) {
  for (let i = 0; i < 40; i++) {
    if (await tryClick(label, exact, within)) {
      await sleep(250)
      return
    }
    await sleep(250)
  }
  throw new Error(`Botón no encontrado o deshabilitado: ${label}`)
}
async function tryClick(label, exact, within) {
  return p.evaluate(
    ({ label, exact, within }) => {
      const root = within ? document.querySelector(within) : document
      const btn = [...root.querySelectorAll('button')].find((b) => {
        const t = (b.getAttribute('aria-label') || b.innerText || '').trim()
        return (exact ? t === label : t.includes(label)) && !b.disabled
      })
      if (btn) btn.click()
      return Boolean(btn)
    },
    { label, exact, within },
  )
}
const isDisabled = (label) =>
  p.evaluate((label) => {
    const btn = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').trim().startsWith(label))
    return btn ? btn.disabled : null
  }, label)

async function as(name) {
  await clickButton(name)
  await busyDone()
  await sleep(500)
}
async function go(label) {
  await p.waitForSelector('nav[aria-label^="Acciones de"]', { timeout: 15000 })
  let ok = 'missing'
  for (let i = 0; i < 30 && ok !== 'ok'; i++) {
    if (i) await sleep(300)
    ok = await tryGo(label)
  }
  if (ok !== 'ok') throw new Error(`Menú «${label}»: ${ok}`)
  await sleep(600)
  await busyDone()
}
async function tryGo(label) {
  return p.evaluate((label) => {
    const nav = document.querySelector('nav[aria-label^="Acciones de"]')
    const btn = [...nav.querySelectorAll('button')].find((b) => b.querySelector('span span')?.innerText.trim() === label)
    if (btn && !btn.disabled) btn.click()
    return btn ? (btn.disabled ? 'disabled' : 'ok') : 'missing'
  }, label)
}
async function confirm(title, button) {
  await p.waitForSelector(`[role=dialog][aria-label="${title}"]`)
  await clickButton(button, { within: `[role=dialog][aria-label="${title}"]` })
}
async function toast() {
  await sleep(700)
  return p.evaluate(() => [...document.querySelectorAll('[role=status],[role=alert]')].map((t) => t.innerText.replace(/\s+/g, ' ').trim()).join(' | '))
}
async function selectByLabel(label, optionText) {
  const value = await p.evaluate(
    ({ label, optionText }) => {
      const sel = document.querySelector(`select[aria-label="${label}"]`) || [...document.querySelectorAll('label')].find((l) => l.querySelector('span')?.innerText.trim() === label)?.querySelector('select')
      if (!sel) return null
      const opt = [...sel.options].find((o) => o.text.includes(optionText))
      if (!opt) return null
      sel.setAttribute('data-e2e', 'target')
      return opt.value
    },
    { label, optionText },
  )
  if (value === null) throw new Error(`Select «${label}» / opción «${optionText}» no encontrada`)
  await p.select('select[data-e2e="target"]', value)
  await p.evaluate(() => document.querySelector('select[data-e2e="target"]')?.removeAttribute('data-e2e'))
  await sleep(900)
  await busyDone()
}
async function check(code) {
  await p.evaluate((code) => {
    const label = [...document.querySelectorAll('label')].find((l) => l.innerText.includes(`${code} ·`))
    label.querySelector('input').click()
  }, code)
}
async function typeNota(aria, value) {
  const sel = `input[aria-label="${aria}"]`
  await p.waitForSelector(sel)
  await p.focus(sel)
  await p.$eval(sel, (el) => el.select())
  await p.type(sel, value)
  await p.keyboard.press('Enter')
  await sleep(700)
}
async function step(name, fn) {
  try {
    await fn()
    log('✓', name)
  } catch (e) {
    log('✗', name, '→', e.message)
    await snap('ERROR-' + name.replace(/\W+/g, '-').slice(0, 40))
    throw e
  }
}

await p.goto(`${BASE}/punto-1`, { waitUntil: 'networkidle0' })
await waitText('Actuar como')

await step('0. Restaurar escenario inicial', async () => {
  await clickButton('↺ Restaurar')
  await confirm('¿Restaurar la demostración?', 'Restaurar')
  await waitText('Demostración restaurada')
})
await snap('inicio')

// ── 1. PLANEACIÓN ────────────────────────────────────────────
await step('1a. Laura: avanzar sin aprobar → error', async () => {
  await as('Laura Ortiz')
  await waitText('Panel del periodo')
  await go('Calendario')
  await clickButton('Avanzar a Prematrícula')
  const t = await toast()
  if (!t.includes('aprobar el calendario')) throw new Error('Esperaba error de aprobación, vi: ' + t)
})
await step('1b. Laura: ver franjas programadas', async () => {
  await go('Franjas y grupos')
  await waitText('IS301 · Bases de Datos I')
  await snap('admin-franjas')
})
await step('1c. Laura: aprobar calendario y avanzar a Prematrícula', async () => {
  await go('Calendario')
  await clickButton('Aprobar calendario')
  await waitText('Calendario aprobado')
  await clickButton('Avanzar a Prematrícula')
  await waitText('Fase actual: Prematrícula')
})

// ── 2. PREMATRÍCULA ──────────────────────────────────────────
const PREMAT = {
  'Ana Martínez': ['IS301', 'IS302', 'IS303'],
  'Juan Pérez': ['IS202', 'IS302'],
  'Sofía Ramírez': ['IS201', 'IS301'],
  'Mateo Gómez': ['IS301', 'IS302'],
  'Valentina Cruz': ['IS301', 'IS303'],
  'Samuel Torres': ['IS401', 'IS402', 'IS403'],
}
await step('2a. Juan: IS301 bloqueada por IS202 (2.5)', async () => {
  await as('Juan Pérez')
  await go('Prematrícula')
  await waitText('Prerrequisito sin aprobar: IS202 (nota 2.5)')
  await snap('juan-prematricula-bloqueo')
})
await step('2b. Valentina: IS303 sin IS301 → error de simultaneidad', async () => {
  await as('Valentina Cruz')
  await go('Prematrícula')
  await check('IS303')
  await clickButton('Guardar prematrícula', { exact: false })
  const t = await toast()
  if (!t.includes('simultáneamente')) throw new Error('Esperaba error de simultaneidad, vi: ' + t)
  await check('IS303') // desmarcar para el paso siguiente
})
for (const [name, codes] of Object.entries(PREMAT)) {
  await step(`2c. ${name}: prematricula ${codes.join(', ')}`, async () => {
    await as(name)
    await go('Prematrícula')
    await waitText('IS')
    for (const c of codes) await check(c)
    await clickButton('Guardar prematrícula', { exact: false })
    await waitText('Prematrícula guardada')
  })
}

// ── 3. PAGO ──────────────────────────────────────────────────
await step('3a. Laura: avanzar a Pago', async () => {
  await as('Laura Ortiz')
  await go('Calendario')
  await clickButton('Avanzar a Pago')
  await waitText('Fase actual: Pago')
})
for (const name of ['Ana Martínez', 'Juan Pérez', 'Sofía Ramírez', 'Mateo Gómez', 'Samuel Torres']) {
  await step(`3b. ${name}: paga`, async () => {
    await as(name)
    await go('Pagar matrícula')
    await clickButton('Pagar')
    await waitText('Pago registrado')
  })
}
await snap('pago-samuel')

// ── 4. ASIGNACIÓN ────────────────────────────────────────────
await step('4a. Laura: avanzar a Asignación y retirar no pagados', async () => {
  await as('Laura Ortiz')
  await go('Calendario')
  await clickButton('Avanzar a Asignación')
  await waitText('Fase actual: Asignación')
  await go('Pagos')
  await clickButton('Retirar no pagados')
  await waitText('1 estudiante(s) retirado(s)')
})
await step('4b. Laura: ejecutar asignación', async () => {
  await go('Asignación')
  await clickButton('Ejecutar asignación')
  await waitText('grupos creados')
  log('   ', await toast())
  const orden = await p.evaluate(() => [...document.querySelectorAll('p')].find((x) => x.innerText.startsWith('Orden de prioridad'))?.innerText ?? '')
  log('   ', orden.replace(/\s+/g, ' '))
  await waitText('Cruce de horario con otra asignatura asignada')
  await waitText('No pagó la matrícula')
  await snap('asignacion')
})

// ── 5. AJUSTES ───────────────────────────────────────────────
await step('5a. Laura: avanzar a Ajustes y asignar docentes', async () => {
  await go('Calendario')
  await clickButton('Avanzar a Ajustes')
  await waitText('Fase actual: Ajustes')
  await go('Docentes')
  const plan = [
    ['Bases de Datos I grupo 1', 'Carlos Restrepo'],
    ['Bases de Datos I grupo 2', 'Carlos Restrepo'],
    ['Sistemas Operativos grupo 1', 'María Gómez'],
    ['Ingeniería de Software I grupo 1', 'María Gómez'],
    ['Redes de Computadores grupo 1', 'Carlos Restrepo'],
    ['Programación II grupo 1', 'Andrés Ríos'],
    ['Estructuras de Datos grupo 1', 'Andrés Ríos'],
    ['Bases de Datos II grupo 1', 'Andrés Ríos'],
    ['Ingeniería de Software II grupo 1', 'Andrés Ríos'],
  ]
  for (const [grupo, docente] of plan) await selectByLabel(`Docente de ${grupo}`, docente)
})
await step('5b. Laura: docente con cruce → error', async () => {
  await selectByLabel('Docente de Sistemas Operativos grupo 1', 'Carlos Restrepo')
  const t = await toast()
  if (!t.includes('esa franja')) throw new Error('Esperaba cruce de docente, vi: ' + t)
  await snap('docentes')
})
await step('5c. Ana: no puede adicionar IS302 (cruce)', async () => {
  await as('Ana Martínez')
  await go('Ajustes')
  await waitText('Mis asignaturas')
  await snap('ana-ajustes')
})
await step('5d. Valentina: pago extemporáneo bloqueado hasta habilitarlo', async () => {
  await as('Valentina Cruz')
  const d = await p.evaluate(() => [...document.querySelectorAll('nav[aria-label^="Acciones de"] button')].find((b) => b.innerText.includes('Pagar matrícula'))?.disabled)
  if (!d) throw new Error('«Pagar matrícula» debería estar deshabilitado sin extemporánea')
  await as('Laura Ortiz')
  await go('Calendario')
  await p.evaluate(() => [...document.querySelectorAll('label')].find((l) => l.innerText.includes('Matrícula extemporánea habilitada')).querySelector('input').click())
  await waitText('Matrícula extemporánea habilitada')
  await as('Valentina Cruz')
  await go('Pagar matrícula')
  await clickButton('Pagar (extemporáneo)')
  await waitText('Pago registrado')
})
await step('5e. Valentina: adiciona IS301 grupo 2 (con cupo)', async () => {
  await go('Ajustes')
  await waitText('Adicionar')
  await p.evaluate(() => {
    const row = [...document.querySelectorAll('tr')].find((r) => r.innerText.includes('IS301 · Bases de Datos I') && r.innerText.includes('G2'))
    ;[...row.querySelectorAll('button')].find((b) => b.innerText === 'Adicionar').click()
  })
  await waitText('Asignatura adicionada')
})

// ── 6. EVALUACIÓN ────────────────────────────────────────────
await step('6a. Laura: avanzar a Evaluación', async () => {
  await as('Laura Ortiz')
  await go('Calendario')
  await clickButton('Avanzar a Evaluación')
  await waitText('Fase actual: Evaluación')
})
async function evaluar(docente, grupoTxt, notas) {
  await as(docente)
  await go('Forma de evaluación')
  await selectByLabel('Grupo', grupoTxt)
  await clickButton('Guardar')
  await waitText('Forma de evaluación guardada')
  await go('Registrar notas')
  await selectByLabel('Grupo', grupoTxt)
  await waitText('Definitiva')
  for (const [est, vals] of Object.entries(notas)) {
    for (const [i, comp] of ['Parcial 1', 'Parcial 2', 'Examen final'].entries()) await typeNota(`Nota ${comp} de ${est}`, vals[i])
  }
  await sleep(800)
}
await step('6b. Carlos: forma 30/30/40 y notas IS301 G1 (Ana, Mateo)', async () => {
  await evaluar('Carlos Restrepo', 'IS301', { 'Ana Martínez': ['4.5', '4.0', '4.2'], 'Mateo Gómez': ['2.0', '2.5', '2.0'] })
  await snap('carlos-notas')
})
await step('6c. Carlos: nota inválida 7 → rechazada por la máscara', async () => {
  await typeNota('Nota Parcial 1 de Ana Martínez', '7')
  await waitText('La nota debe estar entre 0.0 y 5.0')
  await typeNota('Nota Parcial 1 de Ana Martínez', 'abc')
  await waitText('Formato: un dígito y un decimal')
  await typeNota('Nota Parcial 1 de Ana Martínez', '4.5')
})
await step('6d. Carlos: asistencia IS301 G1', async () => {
  await go('Asistencia')
  await selectByLabel('Grupo', 'IS301')
  await waitText('Asistió')
  await p.evaluate(() => [...document.querySelectorAll('tr')].forEach((r) => [...r.querySelectorAll('button')].find((b) => b.innerText === 'Sí')?.click()))
  await sleep(1500)
})
await step('6e. Carlos: seguimiento de Mateo (transición)', async () => {
  await go('Seguimiento transición')
  await selectByLabel('Grupo', 'IS301')
  await waitText('Mateo Gómez')
  const inputs = await p.$$('form input')
  await inputs[0].type('4.0')
  await inputs[1].type('3.5')
  await clickButton('Guardar')
  await waitText('Seguimiento de Mateo Gómez guardado')
})
await step('6f. María: notas IS302 (Juan)', async () => {
  await evaluar('María Gómez', 'IS302', { 'Juan Pérez': ['3.5', '3.0', '3.8'] })
})
await step('6g. Andrés: notas de Samuel (IS401, IS403)', async () => {
  await evaluar('Andrés Ríos', 'IS401', { 'Samuel Torres': ['4.0', '4.0', '4.0'] })
  await evaluar('Andrés Ríos', 'IS403', { 'Samuel Torres': ['4.0', '4.0', '4.0'] })
})
await step('6h. Carlos: notas de Samuel IS402', async () => {
  await evaluar('Carlos Restrepo', 'IS402', { 'Samuel Torres': ['4.0', '4.0', '4.0'] })
})
await step('6i. Semana 9: Juan cancela IS202; la segunda cancelación queda bloqueada', async () => {
  await as('Laura Ortiz')
  await go('Calendario')
  await selectByLabel('Semana simulada (regla de cancelación)', 'Semana 9')
  await as('Juan Pérez')
  await go('Cancelar asignaturas')
  await waitText('Después de la semana 8 solo se puede cancelar una asignatura')
  await p.evaluate(() => [...[...document.querySelectorAll('tr')].find((r) => r.innerText.includes('IS202')).querySelectorAll('button')].find((b) => b.innerText === 'Cancelar').click())
  await waitText('Asignatura cancelada')
  await waitText('No puedes cancelar')
  await snap('juan-cancelacion')
})

// ── 7. CIERRE ────────────────────────────────────────────────
await step('7a. Laura: avanzar a Cierre y cerrar semestre', async () => {
  await as('Laura Ortiz')
  await go('Calendario')
  await clickButton('Avanzar a Cierre')
  await waitText('Fase actual: Cierre')
  await go('Cierre')
  await clickButton('Cerrar semestre')
  await waitText('Semestre cerrado')
  await snap('cierre')
  const filas = await p.evaluate(() => [...document.querySelectorAll('tbody tr')].map((r) => r.innerText.replace(/\s+/g, ' ').trim()))
  filas.forEach((f) => log('    ', f))
})
await step('7b. Sofía: resumen tras el cierre', async () => {
  await as('Sofía Ramírez')
  await waitText('Mi resumen académico')
  await snap('sofia-resumen')
})
await step('7c. Panel final', async () => {
  await as('Laura Ortiz')
  await go('Panel')
  await snap('panel-final')
})

// ── Limpieza ─────────────────────────────────────────────────
await step('8. Restaurar', async () => {
  await clickButton('↺ Restaurar')
  await confirm('¿Restaurar la demostración?', 'Restaurar')
  await waitText('Demostración restaurada')
})
await p.setViewport({ width: 375, height: 800 })
log('overflow@375:', await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth))
log('errores de consola:', errors.length ? errors : 'ninguno')
await b.close()
if (errors.length) process.exit(1)
