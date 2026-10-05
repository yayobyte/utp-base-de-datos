# Guía de prueba y presentación — Punto 1 (Registro de notas UTP)

- **Punto del examen:** 1 — Modelado E-ER convertido en sistema ([especificación](especificacion-punto-1.md))
- **Sitio:** <https://utp-base-de-datos.vercel.app/punto-1>
- **Verificado:** 2026-10-05 en producción, recorriendo este guion completo en Chrome (37 pasos, sin errores).
  Prueba automática: `npm run e2e:punto1` ([`e2e/punto1.mjs`](../e2e/punto1.mjs)).
- **Duración aproximada a mano:** 15–20 minutos.

---

## 0. Antes de empezar

1. Abre `/punto-1` y pulsa **↺ Restaurar** (arriba a la derecha) → **Restaurar**. Todo vuelve al inicio:
   periodo `2026-2` en **Planeación**, semana 1, sin prematrículas, estados originales.
2. Para suplantar a alguien, pulsa su **avatar** en «Actuar como». El avatar activo se ve en negro.
3. El menú de la izquierda muestra solo las acciones de esa persona:
   - **«Ahora»** = disponible en la fase actual.
   - **Gris + «Disponible en: …»** = no corresponde a esta fase.
4. La franja de fases (Planeación → … → Cierre) indica dónde va el proceso. **Solo Laura (Admin) avanza las fases**,
   desde **Calendario**.

> Si algo se ve desactualizado, cambia de persona o de opción del menú: cada pantalla recarga sus datos al abrirse.

### Personas

| Avatar | Persona | Rol | Para qué sirve en la demo |
|---|---|---|---|
| LO | Laura Ortiz | Admin / Registro académico (también hace de Director) | Calendario, franjas, pagos, asignación, docentes, cierre |
| CR | Carlos Restrepo | Docente | Bases de Datos I (grupos 1 y 2), Redes |
| MG | María Gómez | Docente | Sistemas Operativos, Ingeniería de Software I |
| AR | Andrés Ríos | Docente | Programación II, Estructuras, BD II, Ing. Software II |
| AM | Ana Martínez (E001) | Estudiante | **En bloque** → primera en la asignación |
| JP | Juan Pérez (E002) | Estudiante | Perdió IS202 (2.5) → **IS301 bloqueada**; usa la cancelación |
| SR | Sofía Ramírez (E003) | Estudiante | **En prueba** (1 periodo); perdió IS201 → IS302 bloqueada |
| MG | Mateo Gómez (E004) | Estudiante | **Semestre de transición** (plan anterior P2019) |
| VC | Valentina Cruz (E005) | Estudiante | **No paga** → retirada; luego paga extemporáneo |
| ST | Samuel Torres (E006) | Estudiante | Más créditos (25) → segundo en prioridad |

### Plan de estudios y franjas (datos de la demo)

| Código | Asignatura | Créditos | Requisitos | Franjas programadas (máx. grupos) | Cupo por grupo |
|---|---|:---:|---|---|:---:|
| IS201 | Programación II | 4 | IS101 | Miércoles 07–09 (1) | 3 |
| IS202 | Estructuras de Datos | 4 | IS101 | Jueves 14–16 (1) | 3 |
| IS301 | Bases de Datos I | 4 | IS202 | Lunes 07–09 (1), Martes 07–09 (1) | 2 |
| IS302 | Sistemas Operativos | 3 | IS201 | Lunes 07–09 (1) | 2 |
| IS303 | Ingeniería de Software I | 3 | IS201 + **simultánea con IS301** | Lunes 09–11 (2) | 2 |
| IS401 | Bases de Datos II | 4 | IS301 | Martes 09–11 (1) | 2 |
| IS402 | Redes de Computadores | 3 | IS302 | Lunes 09–11 (1) | 2 |
| IS403 | Ingeniería de Software II | 3 | IS303 | Martes 07–09 (1) | 2 |

**Reglas que conviene tener a mano:**
- **Aprobar** = nota ≥ 3.0.
- **Promedio integral** = Σ(nota × créditos) / Σ créditos.
- **Prioridad de asignación:** en bloque → más créditos aprobados → mejor promedio.
- **Cancelación:** libre hasta la semana 8; después, **una sola** asignatura.
- **Estados al cierre:**
  - promedio < 3.0 → *prueba* (suma un periodo);
  - más de 2 periodos en prueba → *fuera* («fuera por un semestre»);
  - promedio ≥ 3.0 → *normal* (también al terminar la transición).

---

## 1. Planeación — Laura

| # | Dónde | Acción | Resultado esperado |
|---|---|---|---|
| 1.1 | Calendario | Pulsa **Avanzar a Prematrícula** sin aprobar | ✕ *«El Consejo Académico debe aprobar el calendario antes de iniciar la prematrícula»* |
| 1.2 | Franjas y grupos | Revisa la tabla (opcional: agrega o quita una franja) | 9 franjas programadas, como en la tabla de arriba |
| 1.3 | Calendario | **Aprobar calendario** → **Avanzar a Prematrícula** | ✓ *«Calendario aprobado…»* y luego *«Fase actual: Prematrícula»*; desaparece la insignia «Calendario sin aprobar» |

**Qué explicar:** el calendario lo aprueba el Consejo Académico. Antes de la prematrícula, el director define en qué
franjas se dicta cada asignatura y cuántos grupos caben en cada una.

## 2. Prematrícula — cada estudiante

En **Prematrícula**, marca las casillas y pulsa **Guardar prematrícula (N créditos)**.

| Estudiante | Marca | Qué mostrar |
|---|---|---|
| Juan | IS202, IS302 | IS301 aparece **bloqueada**: *«Prerrequisito sin aprobar: IS202 (nota 2.5)»*. IS303 también: exige IS301 simultánea |
| Valentina | Primero solo **IS303** → Guardar | ✕ *«IS303 requiere cursar IS301 simultáneamente»*. Luego marca IS301 + IS303 y guarda |
| Ana | IS301, IS302, IS303 | — |
| Sofía | IS201, IS301 | IS302 bloqueada (perdió IS201 con 2.8); repite IS201 |
| Mateo | IS301, IS302 | — |
| Samuel | IS401, IS402, IS403 | Solo ve asignaturas de semestre 4 porque ya aprobó las demás |

Esperado: ✓ *«Prematrícula guardada»* en cada caso.

**Qué explicar:** el sistema solo muestra lo que el plan de estudios y el reglamento permiten. Las asignaturas ya aprobadas
no aparecen.

## 3. Pago

| # | Quién | Dónde | Acción | Resultado esperado |
|---|---|---|---|---|
| 3.1 | Laura | Calendario | **Avanzar a Pago** | *«Fase actual: Pago»* |
| 3.2 | Ana, Juan, Sofía, Mateo, Samuel | Pagar matrícula | **Pagar** | ✓ *«Pago registrado»*. Se muestran créditos y valor simulado (créditos × $180.000) |
| 3.3 | Valentina | — | **No paga** | (escenario de retiro) |

## 4. Asignación — Laura

| # | Dónde | Acción | Resultado esperado |
|---|---|---|---|
| 4.1 | Calendario | **Avanzar a Asignación** | *«Fase actual: Asignación»* |
| 4.2 | Pagos | **Retirar no pagados** | ✓ *«1 estudiante(s) retirado(s)»*. Valentina queda *Retirado: Sí* |
| 4.3 | Asignación | **Ejecutar asignación** | ✓ *«9 grupos creados · 10 asignadas · 2 rechazadas»* |

**Qué revisar en la pantalla de asignación:**
- **Orden de prioridad:** `1. E001 (Ana, en bloque) · 2. E006 (Samuel, 25 cr) · 3. E004 · 4. E002 · 5. E003`.
- **Bases de Datos I:** grupo 1 (lunes 07:00) con Ana y Mateo (2/2, lleno). Sofía va al **grupo 2** (martes 07:00).
  Así se llenan los grupos en orden.
- **Sistemas Operativos:** solo se dicta lunes 07–09, así que Ana y Mateo quedan *rechazada* con *«Cruce de horario con
  otra asignatura asignada»*. Juan sí queda asignado.
- **Valentina:** sus solicitudes salen *rechazada* con *«No pagó la matrícula»* (no se le genera horario).
- El botón queda deshabilitado: la asignación se ejecuta una sola vez por periodo.

## 5. Ajustes

| # | Quién | Dónde | Acción | Resultado esperado |
|---|---|---|---|---|
| 5.1 | Laura | Calendario | **Avanzar a Ajustes** | Se habilitan «Mi horario» y «Ajustes» para los estudiantes |
| 5.2 | Laura | Docentes | Asigna: BD I G1 y G2 → **Carlos**; Sist. Operativos y Ing. Software I → **María**; Redes → **Carlos**; Programación II, Estructuras, BD II, Ing. Software II → **Andrés** | ✓ *«Docente asignado»* |
| 5.3 | Laura | Docentes | Intenta poner a **Carlos** en Sistemas Operativos | ✕ *«El docente ya tiene otro grupo en esa franja horaria»* (lunes 07–09 = BD I G1) |
| 5.4 | Ana | Mi horario / Ajustes | Revisa | IS302 *rechazada* con su motivo; en «Adicionar», Sistemas Operativos aparece con **Adicionar deshabilitado** (cruce) |
| 5.5 | Valentina | menú | Mira «Pagar matrícula» | **Deshabilitado**: *«Requiere matrícula extemporánea habilitada»* |
| 5.6 | Laura | Calendario | Marca **Matrícula extemporánea habilitada** | Insignia «Matrícula extemporánea» en la franja de fases |
| 5.7 | Valentina | Pagar matrícula | **Pagar (extemporáneo)** | ✓ *«Pago registrado»*, estado *extemporaneo* |
| 5.8 | Valentina | Ajustes → Adicionar | **Adicionar** en *IS301 · Bases de Datos I · G2* | ✓ *«Asignatura adicionada»* (G2 tenía cupo 1/2) |

Otras acciones de ajuste (opcionales):
- **Retirar** una asignatura → queda *retirada*.
- **Cambiar de grupo** → solo ofrece grupos con cupo y sin cruce.

## 6. Evaluación

| # | Quién | Dónde | Acción | Resultado esperado |
|---|---|---|---|---|
| 6.1 | Laura | Calendario | **Avanzar a Evaluación** | La semana vuelve a 1 |
| 6.2 | Carlos | Forma de evaluación | Grupo *IS301 G1* → deja 30/30/40 → **Guardar** | ✓ *«Forma de evaluación guardada»*. Si el total no es 100 %, el botón se deshabilita y se ve el error |
| 6.3 | Carlos | Registrar notas | Grupo *IS301 G1*. Ana: 4.5 / 4.0 / 4.2 · Mateo: 2.0 / 2.5 / 2.0 (Enter o Tab entre celdas) | La nota se ve al instante y se guarda sola. **Definitiva:** Ana **4.23** ✓, Mateo **2.15** ✕ |
| 6.4 | Carlos | Registrar notas | Escribe `7` o `abc` | ✕ *«La nota debe estar entre 0.0 y 5.0»* / *«Formato: un dígito y un decimal»* (no se guarda) |
| 6.5 | Carlos | Asistencia | Grupo y fecha → **Sí / No** por estudiante | Se marca al instante |
| 6.6 | Carlos | Seguimiento transición | Solo aparece **Mateo** → Comportamiento 4.0, Dedicación 3.5 → **Guardar** | ✓ *«Seguimiento de Mateo Gómez guardado»* |
| 6.7 | María | Forma de evaluación + Registrar notas | *IS302*: Juan 3.5 / 3.0 / 3.8 | Definitiva 3.47 |
| 6.8 | Andrés / Carlos | Ídem | Samuel 4.0 en IS401, IS403 (Andrés) e IS402 (Carlos) | Definitiva 4.00 |
| 6.9 | Laura | Calendario | **Semana simulada → Semana 9** | Insignia «Semana 9» |
| 6.10 | Juan | Cancelar asignaturas | **Cancelar** IS202 | ✓ *«Asignatura cancelada»*. Luego *«No puedes cancelar»*: ya usó la única cancelación después de la semana 8 |

> **Importante:** toda asignatura matriculada **sin notas** cierra con definitiva **0.0** y baja el promedio.
> Para una demo corta, califica al menos a quienes quieres mostrar «sanos».

## 7. Cierre — Laura

| # | Dónde | Acción | Resultado esperado |
|---|---|---|---|
| 7.1 | Calendario | **Avanzar a Cierre** | Última fase: ya no hay botón «Avanzar» |
| 7.2 | Cierre | **Cerrar semestre** | ✓ *«Semestre cerrado: 6 estudiantes procesados»* y la tabla de cambios |

**Resultado verificado en producción** (siguiendo exactamente esta guía):

| Estudiante | Promedio | Créditos | Estado | Por qué |
|---|---:|---:|---|---|
| Ana Martínez | 3.60 | 19 | normal → **normal** | IS301 4.23, pero IS303 sin notas (0.0) baja el promedio |
| Juan Pérez | 3.13 | 14 | normal → **normal** | IS302 3.47; IS202 cancelada no cuenta |
| Sofía Ramírez | 1.88 | 8 | prueba → **prueba (2 periodos)** | Sin notas en IS201 ni IS301. Un periodo más en prueba la dejaría **fuera** |
| Mateo Gómez | 3.29 | 12 | transición → **normal** | Termina la transición con promedio ≥ 3.0, aunque perdió IS301 |
| Valentina Cruz | 3.38 | 15 | normal → **normal** | Matrícula extemporánea + IS301 adicionada en ajustes |
| Samuel Torres | 3.92 | 35 | normal → **normal** | 4.0 en sus tres asignaturas |

Después del cierre:
- **Sofía → Mi resumen** muestra *prueba*, «2 periodo(s) en prueba» y el historial con las notas de 2026-2.
- **Laura → Panel** muestra los totales por estado, solicitudes, pagos y grupos con su docente.

## 8. Terminar

Pulsa **↺ Restaurar** para dejar el sistema listo para la siguiente presentación.

---

## Mensajes y qué significan

| Mensaje | Dónde | Significado / solución |
|---|---|---|
| «Disponible en: …» (menú en gris) | Menú | La acción no corresponde a la fase actual: Laura debe avanzar el calendario |
| «Elige a quién suplantar» | Punto 1 | No hay persona activa: pulsa un avatar |
| «El Consejo Académico debe aprobar el calendario…» | Calendario | Pulsa **Aprobar calendario** primero |
| «Prerrequisito sin aprobar: X (nota N)» | Prematrícula | Regla del plan de estudios: hay que aprobar X (≥ 3.0) |
| «X requiere cursar Y simultáneamente» | Prematrícula | Marca también Y |
| «No pagó la matrícula» | Asignación / horario | Fue retirado por no pagar a tiempo |
| «Cruce de horario con otra asignatura asignada» | Asignación | La única franja con cupo choca con otra asignatura ya asignada |
| «Sin cupo en las franjas programadas» | Asignación | Todos los grupos posibles se llenaron |
| «La asignación ya se ejecutó en este periodo» | Asignación | Solo se ejecuta una vez; para repetir usa **Restaurar** |
| «El docente ya tiene otro grupo en esa franja horaria» | Docentes | Elige otro docente |
| «Requiere matrícula extemporánea habilitada» | Pago (ajustes) | Laura debe marcarla en Calendario |
| «Los porcentajes suman N %; deben sumar 100 %» | Forma de evaluación | Ajusta los porcentajes |
| «Ya hay notas registradas: no se puede cambiar la forma de evaluación» | Forma de evaluación | Protección de integridad |
| «Ya cancelaste la única asignatura permitida después de la semana 8» | Cancelación | Regla del reglamento |
| «No hay asignaturas matriculadas para cerrar» | Cierre | Nadie quedó asignado; revisa la asignación |

## Problemas frecuentes

| Síntoma | Solución |
|---|---|
| «Configura .env.local» en `/punto-1` | Faltan las variables de la BD #1 (ver [despliegue.md](despliegue.md)) |
| Error al cargar el punto 1 | Abre `/estado`: la BD #1 debe estar *Conectada* con la migración `20261005000000` |
| Quedó a mitad de una presentación anterior | **↺ Restaurar** |
| Un docente no ve grupos | Laura aún no se los asignó (Ajustes → Docentes) |
| «Cargando…» que no termina | Recarga la página; la persona suplantada se recuerda |
