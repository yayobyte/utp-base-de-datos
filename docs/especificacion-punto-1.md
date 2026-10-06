# Especificación — Punto 1: Sistema de Registro de Notas UTP

- **Punto del examen:** 1 — Modelado ER/E-ER con diccionario de datos ([enunciado](examen/exam.md))
- **Unidad / semanas:** Unidad 3 (Diseño de BD, E/R y E-ER), semanas 4–6 según [syllabus](../curso/syllabus.md)
- **Libro guía:** Connolly & Begg, caps. 11–13
- **Modelo base:** [curso/docs/punto-1-modelado-utp.md](../curso/docs/punto-1-modelado-utp.md) + [examen/spec-punto-1-agents.md](examen/spec-punto-1-agents.md)
- **Diseño de la base de datos (explicado):** [modelo-base-datos-punto-1.md](modelo-base-datos-punto-1.md)
- **Estado:** especificación para seguimiento; se actualiza al cerrar el diseño. Dudas en [preguntas-abiertas.md](preguntas-abiertas.md).

---

## 1. Objetivo

Convertir el modelo E-ER en un sistema funcional donde el presentador **suplanta** a cada actor
con un clic y ejecuta los procesos que ese actor puede realizar, recorriendo el calendario
académico completo.

## 2. Modelo de datos (fusión)

| Grupo | Tablas |
|---|---|
| Personas (especialización disjunta) | `persona` → `estudiante` · `docente` · `administrativo` |
| Estado del estudiante (especialización total y disjunta) | `estudiante.estado` ∈ {normal, prueba, transicion, fuera} + `estudiante_prueba(periodos_en_prueba)` · `estudiante_transicion(plan_anterior_id)` · `estudiante_fuera(motivo_retiro)` |
| Estructura académica | `programa_academico` · `plan_estudio` · `plan_asignatura` · `asignatura` · `requisito_asignatura` (prerrequisito / simultaneidad) |
| Calendario | `calendario_academico(fase_actual, semana_actual)` · `actividad_calendario` |
| Programación | `franja_horaria` · `programacion_franja(max_grupos)` |
| Matrícula | `solicitud_prematricula(estado_asignacion, motivo_rechazo)` · `matricula_estudiante(estado_pago)` · `grupo` · `detalle_matricula_grupo(estado_materia)` |
| Evaluación | `forma_evaluacion(porcentaje, fecha_examen)` · `registro_nota` · `registro_asistencia` · `seguimiento_transicion(nota_comportamiento, nota_dedicacion)` |
| Derivados | vista `v_estudiante_resumen(promedio_integral, creditos_acumulados, creditos_aprobados)` |

Atributos derivados (también en `src/domain/punto1/cierre.ts`):
- `promedio_integral = Σ(nota_final × créditos) / Σ créditos`, rango 0.00–5.00.
- `creditos_aprobados` = Σ créditos con nota final ≥ 3.0.
- Transiciones de estado: promedio < 3.0 → **prueba**; `periodos_en_prueba` > 2 → **fuera**.

## 3. Fases del calendario

`planeacion → prematricula → pago → asignacion → ajustes → evaluacion → cierre`

El Admin avanza la fase y fija la **semana simulada** (para la regla de cancelación de la semana 8).

## 4. Actores y acciones

### 4.1 Admin / Registro académico (asume las tareas del Director)

| # | Historia de usuario | Fase | Criterio de aceptación |
|---|---|---|---|
| A1 | Aprobar el calendario y avanzar de fase | todas | La fase cambia y el banner se actualiza |
| A2 | Definir franjas por asignatura y número máximo de grupos | planeacion | No se puede guardar `max_grupos` < 1 |
| A3 | Retirar estudiantes que no pagaron | pago → asignacion | Sus solicitudes quedan rechazadas con motivo "No pagó matrícula" |
| A4 | Ejecutar la asignación de franjas | asignacion | Orden: en bloque → créditos acumulados desc → promedio desc; sin cruces; cada rechazo tiene `motivo_rechazo` |
| A5 | Crear grupos en orden | asignacion | Grupo 1 se llena hasta el cupo de la asignatura, luego grupo 2…, sin superar `max_grupos` |
| A6 | Asignar docentes a los grupos | ajustes | Un docente no puede tener dos grupos en la misma franja |
| A7 | Habilitar matrícula extemporánea | ajustes | Los pagos quedan marcados como "Extemporáneo" |
| A8 | Cerrar el semestre | cierre | Se calculan promedio, créditos y el nuevo estado |
| A9 | Ver el panel (indicadores) | todas | Totales por estado, grupos, rechazos |

### 4.2 Estudiante

| # | Historia de usuario | Fase | Criterio de aceptación |
|---|---|---|---|
| E1 | Prematricular asignaturas | prematricula | Solo aparecen las asignaturas del plan con prerrequisitos aprobados (≥ 3.0) y simultaneidades satisfechas |
| E2 | Pagar la matrícula | pago / ajustes | Estado de pago: Pagado o Extemporáneo |
| E3 | Ver el horario y los motivos de rechazo | ajustes en adelante | Muestra grupo, franja, docente |
| E4 | Hacer ajustes (adicionar, cambiar de grupo, retirar) | ajustes | Valida cupo y cruces |
| E5 | Cancelar asignaturas | evaluacion | Cualquier cantidad hasta la semana 8; después solo 1 hasta el último día |
| E6 | Ver notas, asistencia, promedio y estado | evaluacion / cierre | Valores calculados en tiempo real |

### 4.3 Docente

| # | Historia de usuario | Fase | Criterio de aceptación |
|---|---|---|---|
| D1 | Definir la forma de evaluación y las fechas de examen | evaluacion | Los porcentajes deben sumar 100 |
| D2 | Registrar notas en una rejilla | evaluacion | Entrada con máscara 0.0–5.0; UI optimista |
| D3 | Registrar asistencia por clase | evaluacion | Una marca por estudiante y fecha |
| D4 | Registrar notas de comportamiento y dedicación | evaluacion | Solo para estudiantes en estado *transición* |

## 5. Navegación del punto 1

- **PersonaSwitcher** (franja superior): píldoras agrupadas por rol (Admin · Docentes · Estudiantes); la persona activa se resalta en negro.
- **RoleNav** (lateral): acciones del rol activo; las no disponibles en la fase actual aparecen deshabilitadas con "Disponible en fase X".
- **Banner de fase**: fase actual + semana simulada.
- Rutas: `/punto-1/:rol/:accion`.

## 6. Datos semilla

1 programa (Ingeniería de Sistemas), 1 plan, ~10 asignaturas con prerrequisitos y simultaneidades,
6 franjas, 1 calendario, 1 admin, 3 docentes y 6 estudiantes (normal, en bloque, prueba, transición,
uno que no paga, uno con muchos créditos).

## 7. Pruebas de dominio

Filtro de elegibilidad · orden de asignación y detección de cruces · llenado secuencial de grupos ·
regla de la semana 8 · fórmula del promedio integral · transiciones de estado.

## 8. Implementación

| Capa | Archivo(s) |
|---|---|
| Migración (tablas, subclases, vistas, funciones, datos demo) | [`databases/punto-1/supabase/migrations/20261005000000_registro_notas.sql`](../databases/punto-1/supabase/migrations/20261005000000_registro_notas.sql) |
| Reglas de negocio (puras) | `src/domain/punto1/`: `permisos.ts` (rol × fase), `prematricula.ts`, `asignacion.ts`, `cancelacion.ts`, `evaluacion.ts`, `cierre.ts`, `fases.ts` |
| Datos (ORM) | `src/data/punto1/repositories.ts` (un `Repository` por tabla/vista) + RPC `reiniciar_demo`, `cambiar_estado` |
| Casos de uso | `src/services/punto1/`: `adminService`, `estudianteService`, `docenteService` |
| Suplantación | `src/state/impersonationStore.ts` (Zustand, persistido) |
| UI | `src/features/punto1/`: `Punto1Layout` (PersonaSwitcher, PhaseBanner, RoleNav) + 17 páginas de acción (`admin/`, `estudiante/`, `docente/`) |

**Base de datos (BD #1):**
- Especialización de `persona` por `rol`; especialización **total y disjunta** del estudiante por `estado` con subtablas
  `estudiante_prueba`, `estudiante_transicion`, `estudiante_fuera` (incluye `hasta_periodo` = «fuera por un semestre»).
  `cambiar_estado()` mueve al estudiante de subclase en una sola transacción.
- Atributos derivados en la vista `v_estudiante_resumen` (promedio integral y créditos), con la misma fórmula que `cierre.ts`.
- Vistas `v_grupo_detalle` y `v_solicitud_detalle` para leer horarios sin consultas anidadas.
- `reiniciar_demo()` restaura el escenario inicial (botón en *Calendario* del Admin).

**Datos de demostración:** 10 asignaturas (IS101–IS403) con prerrequisitos y una simultaneidad (IS303 ↔ IS301),
6 franjas, cupos de 2–3 para que se formen varios grupos, 1 admin (Laura Ortiz), 3 docentes y 6 estudiantes:

| Estudiante | Escenario |
|---|---|
| E001 Ana Martínez | En bloque (máxima prioridad) |
| E002 Juan Pérez | Perdió IS202 (2.5) → IS301 bloqueada |
| E003 Sofía Ramírez | En prueba (1 periodo); perdió IS201 → IS302 bloqueada |
| E004 Mateo Gómez | Semestre de transición (plan anterior P2019) |
| E005 Valentina Cruz | Caso «no paga» → retirada; luego matrícula extemporánea |
| E006 Samuel Torres | Más créditos (25) → segundo en prioridad |

**Pruebas:** reglas puras (`punto1.test.ts`), semestre completo de punta a punta sobre la migración real
(`services/punto1/semestre.test.ts`, PGlite + adaptador tipo PostgREST) y la UI (`Punto1Layout.test.tsx`).

## 9. Guion sugerido para la presentación

> Guion detallado, con resultados esperados verificados en producción y la tabla de mensajes: **[guia-pruebas-punto-1.md](guia-pruebas-punto-1.md)**.

1. **Laura (Admin) → Calendario:** aprobar calendario, avanzar a *Prematrícula*.
2. **Juan → Prematrícula:** mostrar IS301 bloqueada por IS202 (2.5); elegir IS202 e IS302.
3. Prematricular a los demás (Ana: IS301, IS302, IS303; Sofía: IS201, IS301; Mateo: IS301, IS302; Valentina: IS301, IS303; Samuel: IS401–IS403).
4. **Admin → Pago:** todos pagan menos Valentina. **Asignación:** *Retirar no pagados* y *Ejecutar asignación*: orden de prioridad, grupos 1 y 2 de IS301, rechazo por cruce de IS302.
5. **Ajustes:** el Admin asigna docentes (cruce bloqueado); un estudiante cambia o retira; Valentina paga extemporáneo.
6. **Evaluación:** Carlos (docente) define 30/30/40, registra notas y asistencia, seguimiento de Mateo (transición). Semana 9: un estudiante cancela una sola asignatura.
7. **Cierre:** el Admin cierra el semestre y se ven los cambios de estado (p. ej. Sofía sigue en prueba, Mateo pasa a normal).
8. **Reiniciar demostración** para dejarlo listo.

## 10. Preguntas de repaso

1. ¿Por qué el estado del estudiante es una especialización **total y disjunta**?
2. ¿Cómo se representa la relación recursiva de requisitos entre asignaturas?
3. ¿Qué atributos son derivados y por qué no se almacenan?
