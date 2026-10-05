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
- [x] Fase 3 — Shell + navegación global
- [x] Fase 4 — Capa de datos (ORM)
- [x] Fase 5 — Punto 2 (PostgreSQL en el navegador; sin BD remota)
- [ ] Fase 6 — Punto 1 (BD ⏸ credenciales proyecto 1)
- [ ] Fase 7 — Punto 3 normalización
- [ ] Fase 8 — Integración GitHub↔Supabase + Vercel (repo listo; faltan pasos del usuario en dashboards)

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
| 2026-10-04 | BD #1 usa las variables públicas de la integración Supabase↔Vercel (`NEXT_PUBLIC_*`); `VITE_P1_*` tiene prioridad si existe. BD #2 usa `VITE_P2_*`. |
| 2026-10-04 | BD #2 = proyecto existente `mrxycubenuuobfkqvzbt`, que ya tiene las 8 tablas DreamHome de clase en `public` (incluye `staff`, choca con el `staff` del examen). Las 11 tablas del punto 2 van en el esquema **`examen`** (+ copia en `baseline`); `run_sql` usa `search_path = examen`; `reset_data` solo toca `examen`. No se modifican las tablas de clase (opcional: RLS solo lectura para anon). |
| 2026-10-04 | Las migraciones se prueban con PGlite (`src/test/pglite.ts`); las páginas con datos, con `pgliteSupabase` en lugar de Supabase. |
| 2026-10-04 | Punto 2 sin Supabase: PostgreSQL en el navegador (PGlite) con las migraciones de `databases/punto-2`. Solo la BD #1 es remota (integración GitHub↔Supabase). |
| 2026-10-04 | Lint con **oxlint** (plantilla actual de Vite) en lugar de ESLint. Vite 8, React 19, TS 6. |

## Pendientes / bloqueos

- ✅ BD #1 desplegada y conectada. Usuario: crear proyecto Supabase #2, conectar GitHub (working dirs `databases/punto-1|2`), importar en Vercel con las 4 variables `VITE_*` — ver docs/despliegue.md. Luego verificar `/estado`.
- Preguntas abiertas: [docs/preguntas-abiertas.md](docs/preguntas-abiertas.md).

## Bitácora

- **2026-10-04 — Punto 2, ajuste de UI (pedido del usuario):** la consola SQL es el bloque principal (arriba); las preguntas a–e van plegadas (`<details>`) debajo; se quitan las pestañas supabase-js y Explicación (y `toSupabaseJs`). El SQL de cada pregunta lleva la pregunta como comentario (`toScript`, líneas de 64 caracteres). Verificado en Chrome: preguntas cerradas al cargar, c = 51.96, el script comentado corre en la consola (7 filas).

- **2026-10-04 — Punto 2 en el navegador (decisión del usuario: sin migraciones en la BD #2):** `src/data/punto2/localDb.ts` arranca PGlite (import dinámico), aplica las migraciones `databases/punto-2/...` (`?raw`) y ejecuta como `anon`; `sqlRunner` usa `callLocal` en lugar de `supabase.rpc`. `@electric-sql/pglite` pasa a dependencia; `optimizeDeps.exclude`. Se quitan: GitHub Action de la BD #2, alias `P2_*` de `vite.config.ts`, `src/test/pgliteSupabase.ts`, guardia de credenciales del punto 2 y la tarjeta BD #2 de `/estado`. Verificado en Chrome real (Puppeteer) con el build de producción: arranque ≈ 2 s, c = 51.96, d deja 3 filas, DROP rechazado, sin scroll horizontal a 375 px, sin errores. Descarga ≈ 5.4 MB gzip solo en `/punto-2`. 53 tests en verde. Aviso de build `[EVAL]` proviene de PGlite (Emscripten), inofensivo.

- **2026-10-04 — BD #2 sin integración GitHub:** Supabase rechaza conectar el repo a un segundo proyecto. Se añade `.github/workflows/deploy-db-punto-2.yml` (supabase/setup-cli + `db push --db-url` con el secreto `P2_DATABASE_URL`, cadena Session pooler). Pendiente: el usuario añade el secreto y/o `P2_DATABASE_URL` en `.env.local` para el primer push manual.

- **2026-10-04 — Variables BD #2 en Vercel:** Vercel no permite crear variables `VITE_*`. Se crearon `P2_SUPABASE_URL` y `P2_SUPABASE_ANON_KEY`; `vite.config.ts` las copia (lista cerrada `PUBLIC_ALIASES`, vía `define`, desactivado en Vitest) a `VITE_P2_*`. Verificado con build simulado: URLs y publishable keys de ambas BD en el bundle, ningún secreto.

- **2026-10-04 — Fase 5 (punto 2):** migración `databases/punto-2/.../20261004010000_examen_dvd.sql`: esquema `examen` (11 tablas sin FKs + datos de las imágenes), `baseline` (copia), RPC `punto2_tables()`, `run_sql(text[])` (invoker/anon, search_path examen, timeout 3 s, solo SELECT/WITH/INSERT/UPDATE/DELETE, una sentencia por elemento, transacción única, DML devuelve filas afectadas) y `reset_data()` (definer). `domain/punto2/examQueries.ts` (a–e con explicación y resultado esperado, `toScript`, `toSupabaseJs`). `services/punto2/punto2Service.ts`. `data/punto2/sqlRunner.ts`: `fetchPunto2Tables` reemplaza `tableRepository` (examen no está en la Data API). UI `features/punto2/` (Punto2Page, ExamPointCard con pestañas SQL/supabase-js/Explicación y confirmación en d/e, SqlConsole con Ctrl+Enter e historial, TablesPanel plegable y fijo, ResultView). Pruebas con **PGlite** sobre la migración real: respuestas a–e (c = 51.96, d deja 3 miembros, e S0415 = 43260), seguridad (DDL rechazado, baseline inaccesible, atomicidad) y UI de punta a punta. Rutas `/punto-2` y `/estado` con carga diferida (sin aviso de chunk > 500 kB). 55 tests en verde.

- **2026-10-04 — BD #2 inspeccionada (solo lectura, vía REST):** proyecto `mrxycubenuuobfkqvzbt` con DreamHome en `public` (branch 5, staff 6, client 4, propertyforrent 6, privateowner 4, viewing 5, registration 4, lease 3), RLS desactivado (anon puede escribir), `dob` con años 20xx. Ninguna tabla del examen ni `health()`. Variables renombradas a `VITE_P2_*` en `.env.local`.

- **2026-10-04 — ✅ Cadena completa BD #1 verificada en producción:** `https://utp-base-de-datos.vercel.app/estado` muestra BD #1 *Conectada*, migración `20261004000000`. GitHub → Supabase (migraciones) → Vercel (build) → navegador funcionando. Pendiente: proyecto Supabase #2.

- **2026-10-04 — Despliegue BD #1 verificado:** integración GitHub↔Supabase aplicó la migración `health` en el proyecto #1 (`slbngbrtpiewenvsiabe`) tras un push nuevo; `health()` responde ok. El build de Vercel no tenía las variables `VITE_*` → la app ahora también lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|ANON_KEY` (creadas por la integración Supabase↔Vercel) mediante `envPrefix: ['VITE_', 'NEXT_PUBLIC_']`. Verificado que ningún secreto (service role, POSTGRES_*) entra al bundle. Vitest fija las variables a vacío para no depender de `.env.local`. 30 tests en verde.

- **2026-10-04 — Despliegue (adelanto de fase 8):** `npx supabase init` en `databases/punto-1` y `databases/punto-2` (project_id `examen-bd-punto-N`; puertos locales del #2 en 553xx). Migración `20261004000000_health.sql` en ambos (esquema `app`, tabla `app.despliegue`, RPC `public.health()` SECURITY DEFINER para anon), validada con PGlite. `src/data/health.ts` (checkHealth, nunca lanza). Env leído de forma perezosa en `clients.ts` (para pruebas). Página `/estado` (`features/estado/StatusPage`) con build de Vercel (`__BUILD_INFO__` vía `define` en vite.config.ts) y estado de ambas BD; enlace en el pie. `vercel.json` con framework/install/build/output; `engines.node >=22.12`. `docs/despliegue.md` reescrito como checklist. 29 tests en verde.

- **2026-10-04 — Fase 4:** `src/data/`: `clients.ts` (getClient p1/p2 con caché, isConfigured, missingEnv; lanza DataError `not_configured`), `orm/DataError.ts`, `orm/types.ts`, `orm/Repository.ts` (findAll, findBy, findOne, getOne, count, insert, update, remove; update/remove exigen filtros), `punto2/sqlRunner.ts` (PUNTO2_TABLES, splitStatements, runSql → RPC `run_sql`, runScript, resetData → RPC `reset_data`, tableRepository), `index.ts`. `testing/fakeSupabase.ts` para pruebas. Hooks `useAsync`, `useProjectStatus`. Componente `features/shared/SupabaseGuard` (aviso "Configura .env.local"). Tipos de env en `src/vite-env.d.ts`. 25 tests en verde; supabase solo se importa en `src/data/`.

- **2026-10-04 — Fase 3:** `src/router.tsx` (createBrowserRouter; `/`, `/punto-1/*`, `/punto-2`, `/punto-3`, 404, `/ui` solo dev). `src/layout/` con AppShell, GlobalNav (píldoras con NavLink activo), Footer negro, SectionHeader y `navigation.ts` (EXAM_POINTS, fuente única de los 3 puntos). Inicio en `features/home/HomePage`. Páginas provisionales `features/shared/PointPlaceholder` (indican la fase pendiente) y `NotFound`. Tests de rutas (10 en total) en verde.

- **2026-10-04 — Fase 2:** `src/theme/` (tokens.ts, applyTheme.ts → variables `--color-*`, `--space-*`, `--radius-*`, `--border-*`, `--shadow-*`, `--size-*`, `--type-*`, `--motion-*`, `--z-*`; global.css). 17 componentes en `src/ui/` (Button, Chip, Card, Input, TextArea, Select, DataTable, Tabs, NavBar, SideNav, Badge, Modal, Toast, CodeBlock, EmptyState, Stat, Stepper) + barrel. Página `/ui` (solo en dev) en `src/features/ui-showcase/`. Tests: tema + render del showcase. Guardas OK (sin hex/px en CSS modules, 3 archivos por componente, todas las variables definidas).

- **2026-10-04 — Fase 1:** scaffold Vite (react-ts) copiado a la raíz. Dependencias: react-router-dom, @supabase/supabase-js, zustand; dev: vitest, @testing-library/react, jest-dom, jsdom. Scripts: dev, build, preview, lint (oxlint), typecheck, test. Alias `@/` → `src/`. `vercel.json` (SPA), `.env.example`, fuente Inter en `index.html`. typecheck/build/lint/test en verde.

- **2026-10-04 — Iteración 1:** plan aprobado. Reestructura: `docs/` → `curso/docs/`, `syllabus.md` y PDFs → `curso/`, `exam/` → `docs/examen/` (`AGENTS.ms` → `spec-punto-1-agents.md`), `exam/PROMPT.md` → `docs/PROMPT.md`. Creados CLAUDE.md, docs/PLAN.md, arquitectura, especificaciones 1–3, preguntas abiertas, despliegue. AGENTS.md y README.md actualizados.
