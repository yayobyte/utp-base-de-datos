# Plan — Exam app: "Examen Final BD (IS644)" on React + Supabase + Vercel

> In-repo copy of the approved plan. Run it phase by phase at low effort: *"Ejecuta docs/PLAN.md fase N"*.
> **Path note (after Phase 0):** `exam/*` now lives in `docs/examen/` (`AGENTS.ms` → `docs/examen/spec-punto-1-agents.md`); class material is in `curso/` (`docs/punto-1-modelado-utp.md` → `curso/docs/punto-1-modelado-utp.md`).

## Context

The user's final exam ([docs/examen/exam.md](examen/exam.md)) has 3 points. Each one becomes a section of a single website (Vite + React + TS, deployed to Vercel, data in Supabase):

1. **Point 1 – Grade-registration system (UTP).** An E-ER model turned into a working app. You can impersonate **Estudiante, Docente or Admin/Registro académico** with one click and run the actions that person is allowed to do. It has its own navigation, driven by role and calendar phase. Uses Supabase DB #1, the main project linked to GitHub.
2. **Point 2 – DVD rental DB (StayHome, images `exam/Imagen1.jpg`, `exam/imagen2.jpg`).** All tables are always visible. A real SQL console and the exam answers a–e can be run step by step, showing both the SQL and the equivalent supabase-js call. Uses Supabase DB #2.
3. **Point 3 – Normalization of the `Préstamo` table.** A step-by-step 0FN → 1FN → 2FN → 3FN walkthrough. Frontend state only (Zustand), no DB.

The current repo is a class-notes repo. It gets restructured: **the app lives at the root and class material moves to `curso/`**. The user wants:
- `CLAUDE.md`: an agent memory/log, updated every iteration.
- `PROMPT.md`: updated every iteration.
- A follow-up spec doc and an open-questions doc for point 1.
- The plan written so a **low-effort** agent can run it task by task.

**Decisions already made by the user:** app at root plus `curso/` · point-2 console runs real SQL through a restricted RPC · point-1 model = merge of `docs/punto-1-modelado-utp.md` and `exam/AGENTS.ms` (drop its NestJS/Chakra stack) · personas = Estudiante, Docente, Admin (Admin also takes over the Director's tasks).

**Fixed constraints:**
- Docs in Spanish (per `AGENTS.md`). UI text in Spanish. Code identifiers in English.
- Each component is **3 files**: `X.tsx`, `X.module.css`, `X.types.ts`.
- Design tokens come only from `src/theme/` and are never hard-coded (see `exam/DESIGN.md`, the Uber system).
- `syllabus.md` is moved, never edited.

---

## How to execute this plan (low effort)

1. **Prerequisite (user, once):** `git` currently fails with *"You have not agreed to the Xcode license"*. Run `sudo xcodebuild -license accept` in a terminal.
2. Lower the session effort to **low**, then say: *"Execute docs/PLAN.md phase N"*. Each phase is independent and ends with a checklist and a verify step.
3. After every phase, the agent **must**:
   - add a dated entry to `CLAUDE.md` → "Bitácora";
   - tick the phase in `docs/PLAN.md`;
   - append a short "Iteración N" note to `docs/PROMPT.md`.
4. Phases that need input the user hasn't given yet are marked **⏸ BLOCKED**: Supabase credentials and project refs. Skip them until the user provides the details.

---

## Target structure

```
/                                   ← app root (Vercel project root)
├── CLAUDE.md                       ← agent memory + log (NEW)
├── AGENTS.md                       ← updated: new paths + app conventions
├── README.md                       ← rewritten: what the app is, how to run/deploy
├── package.json  vite.config.ts  tsconfig*.json  eslint.config.js  index.html
├── vercel.json                     ← SPA rewrite
├── .env.example                    ← VITE_P1_SUPABASE_URL/ANON_KEY, VITE_P2_SUPABASE_URL/ANON_KEY
├── docs/                           ← PROJECT docs (Spanish)
│   ├── PLAN.md                     ← copy of this plan (with checkboxes)
│   ├── PROMPT.md                   ← moved from exam/PROMPT.md, updated each iteration
│   ├── arquitectura.md             ← layers, folders, data flow, conventions
│   ├── especificacion-punto-1.md   ← user stories per role + phase matrix (follow-up doc)
│   ├── preguntas-abiertas.md       ← open questions for the user (point 1 mainly)
│   ├── especificacion-punto-2.md   ← tables, console, answers a–e
│   ├── especificacion-punto-3.md   ← normalization steps
│   ├── despliegue.md               ← Vercel + Supabase GitHub integration steps
│   └── examen/                     ← moved from exam/: exam.md, DESIGN.md, spec-punto-1-agents.md (was AGENTS.ms), *.jpg, *.pdf
├── curso/                          ← CLASS material (moved, content untouched)
│   ├── syllabus.md  *.pdf (3 PDFs from root)
│   └── docs/  (everything currently in docs/: README.md, diagrams/, unidad4-algebra-relacional/, punto-1-modelado-utp.md, …)
├── databases/
│   ├── punto-1/supabase/  config.toml  migrations/  seed.sql   ← GitHub-integration working dir: databases/punto-1
│   └── punto-2/supabase/  config.toml  migrations/  seed.sql   ← working dir: databases/punto-2 (2nd project)
└── src/
    ├── main.tsx  App.tsx  router.tsx
    ├── theme/          tokens.ts (colors, typography, spacing, radii, shadows, breakpoints) · applyTheme.ts (writes :root CSS vars from tokens) · global.css (reset + font + uses vars only)
    ├── ui/             one folder per element, 3 files each: Button, Pill/Chip, Card, Input, TextArea, Select, Table (DataTable), Tabs, NavBar, SideNav, Badge, Modal, Toast, CodeBlock, EmptyState, Stat, Stepper  + ui/index.ts barrel
    ├── layout/         AppShell (GlobalNav + Footer), SectionHeader
    ├── data/           ← ORM-like layer
    │   ├── clients.ts            two supabase clients (p1, p2) from env
    │   ├── orm/Repository.ts     generic Repository<T>: findAll, findBy, findOne, insert, update, remove (wraps supabase-js, typed, throws DataError)
    │   ├── orm/types.ts          Database types per project
    │   ├── punto1/*.repository.ts   one per table (EstudianteRepository, GrupoRepository, …)
    │   └── punto2/sqlRunner.ts      runSql(statements[]) → RPC run_sql; resetData() → RPC reset_data; tableRepository(name)
    ├── domain/         ← business rules, pure TS, unit-tested, no React, no supabase
    │   ├── punto1/ permisos.ts (role × phase → allowed actions) · prematricula.ts · pago.ts · asignacion.ts · grupos.ts · ajustes.ts · evaluacion.ts · cierre.ts (promedio integral, créditos, estado transition matrix)
    │   ├── punto2/examQueries.ts   (a–e definitions: title, statements[], supabase-js equivalent, explanation)
    │   └── punto3/normalizacion.ts (source rows + pure functions producing each NF + explanations)
    ├── services/       ← use-cases: call domain + repositories (e.g. runAsignacion(), registrarNota())
    ├── state/          Zustand stores: impersonationStore (persisted), normalizacionStore
    ├── hooks/          useAsync, useCurrentPersona, usePhase, useTable
    └── features/
        ├── home/         landing: 3 cards → points
        ├── punto1/       PersonaSwitcher, RoleNav, pages per action (see Phase 6)
        ├── punto2/       TablesPanel, SqlConsole, ExamPointsPanel, ResultView
        └── punto3/       NormalizationStepper, StepView, DependencyList
```

**Dependencies:**
- runtime: `react-router-dom` · `@supabase/supabase-js` · `zustand`
- dev: `vitest` · `@testing-library/react` · `jsdom` · `supabase` (CLI, via npx)
- Font: **Inter** via Google Fonts, the documented substitute for UberMove.
- No UI library: the UI is built in `src/ui/`.

---

## Phase 0 — Restructure + project docs (no code)  ☑ (2026-10-04)

1. `git mv` (fallback: `mv`):
   - `docs/*` → `curso/docs/`; `syllabus.md` and the 3 root PDFs → `curso/`.
   - `exam/PROMPT.md` → `docs/PROMPT.md`; the rest of `exam/*` → `docs/examen/`; rename `AGENTS.ms` → `spec-punto-1-agents.md`.
   - Delete the empty `exam/`. Remove `.DS_Store` files and add `.DS_Store` to `.gitignore`.
2. Fix the relative links inside the moved `curso/docs/README.md` and the root `README.md`. Do not edit `curso/syllabus.md`.
3. Update `AGENTS.md`:
   - new structure (curso/ vs app);
   - keep all class-doc rules but scope them to `curso/`;
   - add the "App conventions" section (3-file components, tokens only, layers, Spanish UI).
4. Create `CLAUDE.md` with these sections: Propósito · Reglas clave (pointer to AGENTS.md, docs/arquitectura.md) · Estado actual (phase checklist) · Decisiones tomadas (the 4 user decisions above + every new one) · Pendientes/bloqueos · Bitácora (dated entries, newest first).
5. Copy this plan to `docs/PLAN.md` with checkboxes.
6. Write these docs:
   - `docs/arquitectura.md`
   - `docs/especificacion-punto-1.md`, `docs/especificacion-punto-2.md`, `docs/especificacion-punto-3.md`, from the sections below
   - `docs/preguntas-abiertas.md` (list below)
   - `docs/despliegue.md`
7. Update `docs/PROMPT.md`: fix the duplicated "FUNCTIONALITY POINT 3" heading (the first one is point 1). Append "Iteración 1: plan + estructura".

**Verify:** `ls`; every markdown link in `README.md`, `AGENTS.md` and `curso/docs/README.md` resolves (`grep -o '](.*)'` + `test -e`).

## Phase 1 — Scaffold app  ☑ (2026-10-04)

1. Run `npm create vite@latest . -- --template react-ts` in a temp dir and copy the files to the root, so the scaffold doesn't overwrite README/.gitignore.
2. Add the dependencies above. Scripts: `dev`, `build`, `preview`, `lint`, `test`, `typecheck`.
3. Add `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
4. Add `.env.example`. Add `.env*.local` to `.gitignore`.
5. In `tsconfig`, add the path alias `@/` → `src/` (mirror it in `vite.config.ts`).

**Verify:** `npm run build && npm run typecheck`.

## Phase 2 — Theme + UI kit  ☑ (2026-10-04)

1. `src/theme/tokens.ts` holds `exam/DESIGN.md` values verbatim:
   - colors: primary #000, body #5e5e5e, mute #afafaf, canvas, canvas-soft #efefef, canvas-softer #f3f3f3, surface-pressed #e2e2e2, black-elevated #282828, link #0000ee
   - typography: display-xxl…caption, button-large/md
   - spacing: xxs 4 … 3xl 32
   - rounded: none, md 8, lg 12, xl 16, pill 999, pill-tab 36
   - shadows: level1/2/3
   - breakpoints: 600/768/1120/1136
   - plus **one semantic exception**: status colors (success/warning/danger) in grayscale + icons. Document this in `arquitectura.md`, since the design forbids accents.
2. `applyTheme.ts` turns the tokens into `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--font-*` vars on `:root`, and is called in `main.tsx`. CSS modules **only** use `var(--…)`.
3. Build every `src/ui/*` element with the 3-file pattern. Use typed variant props (e.g. Button `variant: 'primary'|'secondary'|'subtle'|'floating'|'large'`). All interactive elements use `--radius-pill`; cards use `--radius-xl`. DataTable follows `ex-data-table-cell`.
4. Add a dev-only `/ui` route showing every element (a mini-storybook).

**Verify:**
- `npm run build`.
- `grep -rnE '#[0-9a-fA-F]{3,6}|[0-9]+px' src --include=*.module.css` returns nothing (only `var(--…)`).
- Every `src/ui/*` folder has exactly 3 files.

## Phase 3 — Shell + global navigation  ☑ (2026-10-04)

1. Routes:
   - `/` home
   - `/punto-1/*` (its own layout)
   - `/punto-2`
   - `/punto-3`
   - `/ui` (dev only)
2. `GlobalNav`: logo text "Examen Final BD", 3 pill links (Punto 1 · Modelado E-ER, Punto 2 · Consultas SQL, Punto 3 · Normalización). It's simple on purpose.
3. Home: hero band (light), 3 cards. Each card has a short summary of the point and a black CTA pill.

**Verify:** `npm run dev`; click through all routes at desktop and at a 375px width.

## Phase 4 — Data layer (ORM)  ☑ (2026-10-04)

1. `clients.ts`: `p1` and `p2` `createClient`. If env vars are missing, show an inline "Configura .env.local" EmptyState instead of crashing.
2. `Repository<T>` generic over the table name. Methods return typed rows. All errors are mapped to `DataError {message, code}`.
3. `sqlRunner.ts`: `runSql(statements: string[])` → `p2.rpc('run_sql', { statements })` → `{ columns, rows, rowCount, durationMs }`; `resetData()` → `p2.rpc('reset_data')`.
4. Unit-test the repository with a mocked supabase client (vitest).

## Phase 5 — Point 2 DB + UI  ☑ (2026-10-04 · PostgreSQL en el navegador con PGlite; sin BD remota)

> **Actualización 2026-10-04:** la BD #2 es un proyecto existente con las tablas DreamHome de clase en `public` (incluye `staff`). Todo el punto 2 va en el esquema **`examen`** (tablas) + **`baseline`** (copia para reset). `run_sql` fija `search_path = examen, public`; `reset_data` solo toca `examen`; el panel de tablas lee vía RPC, sin exponer `examen` en la Data API. No tocar `public`.

**Migration `databases/punto-2/supabase/migrations/<ts>_dvd.sql`:**
- 11 tables exactly as in the images, with no FKs ("not related, not normalized"): `distributioncenter, staff, dvd, actor, dvdactor, member, tipomembrecia, deseo, alquiler, dvdrental, dvdcopy`.
- **Data goes into the migration, not `seed.sql`.** Supabase docs: seed files are *not* applied to production. `seed.sql` only re-runs the same inserts for preview branches.
- Transcribed data:
  - **DistributionCenter:** D001 8 Jefferson Way Portland OR 97201 S1500 · D002 City Center Plaza Seattle WA 98122 S0010 · D003 14–8th Avenue New York NY 10012 S0415 · D004 2 W. El Camino San Francisco CA 94087 S2250
  - **Staff:** S1500 Tom Daniels Manager 48000 tdaniels@stayhome.com D001 · S0003 Sally Adams Assistant 30000 sadams@… D001 · S0010 Mary Martinez Manager 51000 D002 · S3250 Robert Chin Assistant 33000 D002 · S2250 Sally Stern Manager 48000 D004 · S0415 Art Peters Manager 42000 D003
  - **DVD:** 207132 Casino Royale Action PG-13 · 902355 Harry Potter and the GOF Children PG · 330553 Lord of the Rings III Action PG-13 · 781132 Shrek 2 Children PG · 445624 Mission Impossible III Action PG-13 · 634817 War of the Worlds Sci-Fi PG-13
  - **Actor:** A1002 Judi Dench · A3006 Elijah Wood · A2019 Tom Cruise · A7525 Ian McKellen · A4343 Mike Myers · A8401 Daniel Radcliffe
  - **DVDActor:** A1002 207132 M · A3006 330553 Frodo Baggins · A2019 445624 Ethan Hunt · A2019 634817 Ray Ferrier · A7525 330553 Gandalf · A4343 781132 Shrek · A8401 902355 Harry Potter
  - **Member** (memberNo, mFName, mLName, mStreet, mCity, mState, mZipCode, mEMail, clave='*******', mTypeNo, dCenterNo): M250178 Bob Adams 57–11th Avenue Seattle WA 98105 badams@yahoo.com MT2 D002 · M166884 Ann Peters 89 Redmond Rd Portland OR 97117 apeters@hotmail.com MT3 D001 · M115656 Serena Parker 2 W. Capital Way Portland OR 97201 sparker@port.edu MT1 D001 · M284354 Don Nelson 123 Suffolk Lane Seattle WA 98117 dnelson1@msoft.com MT1 D002
  - **TipoMembrecia:** MT1 5-at-a-time 5 14.99 · MT2 3-at-a-time 3 11.99 · MT3 1-at-a-time 1 9.99
  - **Deseo:** M250178 330553 1 · M250178 634817 2 · M166884 207132 1 · M166884 330553 2 · M166884 634817 3
  - **Alquiler:** R75346191 M284354 2006-02-04 · R75346282 M284354 2006-02-04 · R66825673 M115656 2006-02-05 · R66818964 M115656 2006-02-02
  - **DVDRental:** R75346191 24545663 2006-02-06 · R75346282 24343196 2006-02-06 · R66825673 19900422 2006-02-07 · R66818964 17864331 NULL
  - **DVDCopy:** 19900422 Y 207132 D001 · 24545663 Y 207132 D002 · 17864331 N 634817 D001 · 24343196 Y 634817 D002
- Schema `baseline` holds an identical copy of every table, plus `reset_data()`: truncates `public.*` and re-inserts from `baseline` (SECURITY DEFINER).
- `run_sql(statements text[]) returns jsonb`:
  - SECURITY DEFINER, `SET LOCAL ROLE exam_runner`, `SET LOCAL statement_timeout='3s'`.
  - Rejects anything that isn't SELECT/WITH/INSERT/UPDATE/DELETE, and anything touching `baseline` or system schemas.
  - Runs the statements in order inside the function's transaction.
  - Returns `{columns, rows, rowCount}` of the last statement: `json_agg` for SELECT; for DML add `RETURNING *` when absent.
- Role `exam_runner` has DML on `public` tables only (no DDL).
- Grants: `anon` gets SELECT on tables and EXECUTE on the 2 functions. RLS: read-only policy for anon.

**`domain/punto2/examQueries.ts`** — answers (also listed in `especificacion-punto-2.md`):
- **a:** `SELECT d.title, a.actorName, da.character FROM dvd d JOIN dvdactor da ON da.catalogNo=d.catalogNo JOIN actor a ON a.actorNo=da.actorNo ORDER BY d.title, a.actorName;`
- **b:**
  ```sql
  SELECT d.title, c.dvdNo, m.mFName||' '||m.mLName AS alquilado_por, al.fechaSalida, r.fechaEntrega,
         CASE WHEN r.fechaEntrega IS NULL THEN 'No devuelta' ELSE 'Devuelta' END AS estado
  FROM alquiler al
  JOIN member m ON m.memberNo=al.memberNo
  JOIN dvdrental r ON r.deliveryNo=al.deliveryNo
  JOIN dvdcopy c ON c.dvdNo=r.dvdNo
  JOIN dvd d ON d.catalogNo=c.catalogNo
  ORDER BY estado DESC;
  ```
  Expected: War of the Worlds, copy 17864331, Serena Parker, not returned.
- **c:** `SELECT SUM(t.cargoMes) AS ingreso_mensual FROM member m JOIN tipomembrecia t ON t.mTypeNo=m.mTypeNo;` → **51.96**
- **d:** 4 ordered statements:
  1. DELETE `deseo` for Serena
  2. DELETE `dvdrental` where deliveryNo is in Serena's `alquiler`
  3. DELETE `alquiler`
  4. DELETE `member` (looked up by `mFName='Serena' AND mLName='Parker'`)

  Then SELECTs to prove she's gone.
- **e:** `UPDATE staff SET salary = CASE WHEN salary > (SELECT AVG(salary) FROM staff) THEN salary*1.02 ELSE salary*1.03 END;` The average is 42000, so Art Peters (=avg) gets 3%. This is noted in open questions.

**UI `/punto-2`** (3-zone layout):
- Left/top `TablesPanel`: every table always visible as a compact DataTable card, collapsible, with its row count. It re-fetches after every run.
- `ExamPointsPanel`: cards a–e. Each card shows the question, a "Ejecutar" pill, the SQL (CodeBlock), the supabase-js equivalent (tab), the explanation, and the result. Mutating points (d, e) show a confirm modal and a "Restablecer datos" button.
- `SqlConsole`: textarea, run (Ctrl+Enter), result grid, and a history of the last 10 queries. Statements are split on `;` at line end.

**Verify:** run a–e against the deployed DB. c = 51.96, b = 1 not-returned row, d leaves 3 members, e gives S0415 = 43260. Then reset.

## Phase 6 — Point 1 DB + system  ☑ (2026-10-05 · migración se despliega con el próximo push)

**Model (merge).** Use the tables from `curso/docs/punto-1-modelado-utp.md`:
- persona → estudiante | docente | administrativo
- programa_academico, plan_estudio, plan_asignatura, asignatura, requisito_asignatura
- calendario_academico, actividad_calendario (with `fase` enum), franja_horaria, programacion_franja
- solicitud_prematricula, matricula_estudiante, grupo, detalle_matricula_grupo
- forma_evaluacion, registro_nota, registro_asistencia, seguimiento_transicion
- **plus**, from AGENTS.ms: estado subclasses as a disjoint/total specialization. Implement it as `estudiante.estado` + subtype tables `estudiante_prueba(periodos_en_prueba)`, `estudiante_transicion(plan_anterior_id)`, `estudiante_fuera(motivo_retiro)`. Derived values `promedio_integral` and `creditos_acumulados` come from a SQL view `v_estudiante_resumen`, with the formula mirrored in `domain/punto1/cierre.ts`.
- CHECK constraints from both data dictionaries.
- Seed data lives in the migration: 1 programa, 1 plan, ~10 asignaturas with pre-requisites/co-requisites, 6 franjas, 1 calendar with 7 phases, personas = 1 admin, 3 docentes, 6 estudiantes (mix: normal, en bloque, prueba, transición, one who won't pay).
- RLS: anon full access (demo with no auth). Permissions are enforced in `domain/punto1/permisos.ts`. This is noted in open questions.

**Phases** (`fase_actual` on the calendar, advanced by Admin): `planeacion → prematricula → pago → asignacion → ajustes → evaluacion → cierre`.

**Role × action matrix** (`permisos.ts` is the single source; the UI shows disabled actions with the reason "Disponible en fase X"):

| Rol | Acciones |
|---|---|
| Admin / Registro académico | Approve calendar & advance phase · define franjas + max groups per franja (Director's task) · retire unpaid students · run slot assignment (priority: en bloque → créditos desc → promedio desc; log `motivo_rechazo`; no clashes; plan rules) · build groups sequentially by cupo · assign teachers to groups · enable extemporaneous enrollment · close semester (compute promedio, créditos, estado transitions) · dashboard |
| Estudiante | Pre-register (only eligible subjects: plan + pre-reqs ≥3.0 + co-reqs) · pay tuition (normal/extemporaneous) · view timetable + rejection reasons · adjustments (add/change group/withdraw, in `ajustes`) · cancel subjects (unlimited until week 8, then 1 until the last day; simulated "semana actual" set by Admin) · view grades, attendance, promedio, estado |
| Docente | Define evaluation scheme per group (percentages must sum to 100) and exam dates · grade grid (0.0–5.0 masked input, optimistic UI) · attendance per class date · behaviour/dedication grades (only for students in `transicion`) |

**UI `/punto-1`:**
- `PersonaSwitcher`: a top strip of avatar pills, one per seeded persona, grouped by role. One click impersonates; it's persisted in `impersonationStore`.
- `RoleNav`: left SideNav (`ex-app-shell-row`) listing that role's actions with phase badges.
- A phase banner shows the current phase and simulated week.
- Each action is one page under `features/punto1/<rol>/<accion>/`.
- Pages call `services/punto1/*`, which call `domain` + `repositories`. Pages never call supabase directly.

**Domain tests (vitest):**
- eligibility filter
- assignment ordering + clash detection
- sequential group fill
- week-8 cancel rule
- promedio integral formula Σ(nota·créditos)/Σcréditos
- estado transitions (promedio <3.0 → prueba; periodos_en_prueba >2 → fuera)

**Verify:** `npm test`, then play through all phases end to end as Admin → Estudiante → Admin → Docente → Admin (cierre) and check the estados change.

## Phase 7 — Point 3 normalization  ☑ (2026-10-04)

- `domain/punto3/normalizacion.ts` holds the 5 source rows from `exam.md` and pure functions for each step.
- Each step returns `{ tables: {name, columns, keys, rows}[], dependencias: string[], explicacion: string, cambios: string[] }`. The steps:
  - **0FN (UNF)** — the original table. Point out the problems: multi-valued `Autor` ("Nancy Greenberg y Priya Nathan"), composite `NombreLector` ("Apellidos, Nombre"), repeated McGraw Hill / Murray Spiegel / Pérez Gómez, Juan (anomalies).
  - **1FN** — atomic values: split authors into 2 rows (1006 appears twice); split lector into `ApellidosLector`, `NombreLector`. PK = (CodLibro, Autor).
  - **2FN** — remove partial dependencies on CodLibro → `Libro(CodLibro, Titulo, Editorial)`, `LibroAutor(CodLibro, Autor)`, `Prestamo(CodLibro, ApellidosLector, NombreLector, FechaDev)`.
  - **3FN** — remove transitive dependencies/redundancy with surrogate keys → `Editorial(IdEditorial, Nombre)`, `Autor(IdAutor, Nombre)`, `Lector(IdLector, Apellidos, Nombre)`, `Libro(CodLibro, Titulo, IdEditorial)`, `LibroAutor(CodLibro, IdAutor)`, `Prestamo(CodLibro, IdLector, FechaDev)`.
- `normalizacionStore` (Zustand) holds the current step plus "edit source row" (a sandbox), so the audience can watch the NFs recompute.
- UI:
  - Stepper (0→3) with prev/next buttons.
  - Tables before/after side by side, with changed columns highlighted (grayscale bold/underline, no accent colors).
  - A functional-dependency list rendered as `A → B` chips.
  - A final summary diagram (CSS boxes + PK/FK labels).
- Unit tests for each step's output shape and row counts.

## Phase 8 — Supabase GitHub integration + Vercel deploy  ☐ ⏸ BLOCKED (needs project refs)

1. Install the CLI: `npx supabase init` inside each `databases/punto-N`. Link with `npx supabase link --project-ref <ref> --workdir databases/punto-N`.
2. Dashboard → Project 1 → Integrations → GitHub:
   - repo = this repo
   - **Working directory = `databases/punto-1`**
   - enable **Deploy to production** (branch `master`)
   - optional **Automatic branching** with "Supabase changes only".
3. Project 2: same steps with working directory `databases/punto-2`. Multi-project linking to one repo isn't documented by Supabase. If it's refused, the fallback is `npx supabase db push --workdir databases/punto-2` (documented in `despliegue.md`).
4. Vercel: import the repo, framework Vite, root `.`, set the 4 `VITE_*` env vars.

**Verify:** a push with a new migration shows up in the Supabase dashboard; the Vercel preview URL works on all 3 points.

---

## `docs/preguntas-abiertas.md` (initial content)

1. Admin also does the Director's work (franjas, max groups, assign teachers). OK, or add Director later?
2. No real auth: impersonation only, RLS open to anon. Acceptable for the presentation?
3. Should the simulated date/week be controlled by Admin (proposed), or follow the real date?
4. Point 2e: should salary = average get 3% (proposed) or no raise?
5. Point 2d: should copies Serena has out (17864331) be marked available again after deletion?
6. Point 2: should the reset button be visible to everyone or hidden behind a "modo presentador" toggle?
7. "Fuera por un semestre" vs AGENTS.ms subclasses (Normal/Prueba/Transición/Fuera): include it as a 5th state?
8. "Bloque" definition: a flag on the student (proposed), or derived from the plan semester?
9. Supabase: project refs/URLs/anon keys for DB1 and DB2; Vercel team/project name.
10. Point 3: does the professor expect BCNF/4FN, or does 3FN suffice?

## Verification (whole project)

- `npm run typecheck && npm run lint && npm test && npm run build` are all green.
- Grep guards: no hex/px literals in `*.module.css`; every `src/ui/*` and `src/features/**` component folder has exactly 3 files; no `supabase` import outside `src/data/`.
- Manual walkthrough on `npm run dev` and on the Vercel preview: home → each point; point 2 a–e results match the expected values; point 1 full phase cycle; point 3 stepper.
- `CLAUDE.md` Bitácora, `docs/PLAN.md` checkboxes and `docs/PROMPT.md` iteration notes are updated.

## Extra — Talleres de clase (2026-10-09) ✅

Sección aparte del examen: `/talleres` (índice) y `/talleres/:tallerId`. Catálogo en `src/domain/talleres/catalog.ts` (scripts de `curso/docs/taller-joins/` vía `?raw`; ejercicios con `parseExercises`). Datos: `src/data/talleres/tallerDb.ts`.
