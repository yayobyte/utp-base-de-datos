# CLAUDE.md — Memoria del agente

Leer **siempre** antes de trabajar. Actualizar la sección *Bitácora* y *Estado actual* al terminar cada iteración.

## Propósito

Repositorio de la asignatura Bases de Datos I (IS644, UTP) que contiene:

1. **App del examen final** (raíz): Vite + React + TypeScript, desplegada en Vercel, datos en Supabase. Resuelve los 3 puntos de [docs/examen/exam.md](docs/examen/exam.md).
2. **Material de clase** en [`curso/`](curso/) (apuntes, talleres SQL, syllabus, PDFs).

## Reglas clave

- Convenciones generales: [AGENTS.md](AGENTS.md).
- Plan ejecutable por fases: [docs/PLAN.md](docs/PLAN.md). Ejecutar una fase a la vez.
- Arquitectura: [docs/arquitectura.md](docs/arquitectura.md).
- Sistema de diseño (Uber): [docs/examen/DESIGN.md](docs/examen/DESIGN.md). Solo tokens de `src/theme/`.
- Cada componente = 3 archivos: `X.tsx`, `X.module.css`, `X.types.ts`.
- Capas: `features` → `services` → `domain` (reglas puras) + `data` (ORM). Solo `src/data/` importa supabase.
- Documentación y UI en español; identificadores de código en inglés.
- No editar `curso/syllabus.md`.
- Tras cada iteración: actualizar este archivo, marcar la fase en `docs/PLAN.md` y añadir nota en `docs/PROMPT.md`.

## Estado actual

- [x] Fase 0 — Reestructura + documentación
- [x] Fase 1 — Scaffold Vite/React/TS
- [x] Fase 2 — Tema + kit UI
- [ ] Fase 3 — Shell + navegación global
- [ ] Fase 4 — Capa de datos (ORM)
- [ ] Fase 5 — Punto 2 (BD ⏸ credenciales proyecto 2)
- [ ] Fase 6 — Punto 1 (BD ⏸ credenciales proyecto 1)
- [ ] Fase 7 — Punto 3 normalización
- [ ] Fase 8 — Integración GitHub↔Supabase + Vercel (⏸)

## Decisiones tomadas

| Fecha | Decisión |
|---|---|
| 2026-10-04 | App en la raíz; material de clase en `curso/`; material del examen en `docs/examen/`. |
| 2026-10-04 | Consola del punto 2 ejecuta SQL real vía RPC restringida `run_sql` + `reset_data`; muestra equivalente supabase-js. |
| 2026-10-04 | Modelo punto 1 = fusión de `curso/docs/punto-1-modelado-utp.md` + `docs/examen/spec-punto-1-agents.md` (sin NestJS/Chakra). |
| 2026-10-04 | Personas suplantables: Estudiante, Docente, Admin/Registro académico (Admin asume tareas del Director). |
| 2026-10-04 | Datos de producción van en migraciones (Supabase no aplica `seed.sql` en producción). |
| 2026-10-04 | Punto 3 usa solo estado frontend (Zustand), sin BD. |
| 2026-10-04 | Tipografía como shorthand CSS: `font: var(--type-body-md)`. Los tests (`*.test.ts(x)`) no cuentan en la regla de 3 archivos. |
| 2026-10-04 | Lint con **oxlint** (plantilla actual de Vite) en lugar de ESLint. Vite 8, React 19, TS 6. |

## Pendientes / bloqueos

- Credenciales Supabase (URL, anon key, project ref) de BD1 y BD2.
- Preguntas abiertas: [docs/preguntas-abiertas.md](docs/preguntas-abiertas.md).

## Bitácora

- **2026-10-04 — Fase 2:** `src/theme/` (tokens.ts, applyTheme.ts → variables `--color-*`, `--space-*`, `--radius-*`, `--border-*`, `--shadow-*`, `--size-*`, `--type-*`, `--motion-*`, `--z-*`; global.css). 17 componentes en `src/ui/` (Button, Chip, Card, Input, TextArea, Select, DataTable, Tabs, NavBar, SideNav, Badge, Modal, Toast, CodeBlock, EmptyState, Stat, Stepper) + barrel. Página `/ui` (solo en dev) en `src/features/ui-showcase/`. Tests: tema + render del showcase. Guardas OK (sin hex/px en CSS modules, 3 archivos por componente, todas las variables definidas).

- **2026-10-04 — Fase 1:** scaffold Vite (react-ts) copiado a la raíz. Dependencias: react-router-dom, @supabase/supabase-js, zustand; dev: vitest, @testing-library/react, jest-dom, jsdom. Scripts: dev, build, preview, lint (oxlint), typecheck, test. Alias `@/` → `src/`. `vercel.json` (SPA), `.env.example`, fuente Inter en `index.html`. typecheck/build/lint/test en verde.

- **2026-10-04 — Iteración 1:** plan aprobado. Reestructura: `docs/` → `curso/docs/`, `syllabus.md` y PDFs → `curso/`, `exam/` → `docs/examen/` (`AGENTS.ms` → `spec-punto-1-agents.md`), `exam/PROMPT.md` → `docs/PROMPT.md`. Creados CLAUDE.md, docs/PLAN.md, arquitectura, especificaciones 1–3, preguntas abiertas, despliegue. AGENTS.md y README.md actualizados.
