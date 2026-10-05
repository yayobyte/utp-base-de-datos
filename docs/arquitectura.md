# Arquitectura — App del Examen Final (IS644)

- **Proyecto:** app web que resuelve los 3 puntos de [examen/exam.md](examen/exam.md)
- **Stack:** Vite + React 19 + TypeScript · React Router · Zustand · Supabase (supabase-js) · Vercel
- **Diseño:** [examen/DESIGN.md](examen/DESIGN.md) (sistema de diseño de Uber, fuente *Inter* como sustituto de UberMove)
- **Relacionado:** [PLAN.md](PLAN.md) · [despliegue.md](despliegue.md)

---

## 1. Vista general

```
                 ┌───────────── Vercel (SPA estática) ─────────────┐
                 │  GlobalNav: Inicio · Punto 1 · Punto 2 · Punto 3 │
                 └───────┬──────────────────┬──────────────────┬────┘
                         │                  │                  │
               features/punto1     features/punto2     features/punto3
                         │                  │                  │
                  services/punto1    services/punto2       state/normalizacionStore
                    │        │              │                  │
             domain/punto1  data/punto1   data/punto2       domain/punto3
                              │          (sqlRunner→localDb)
                     Supabase BD #1     PGlite en el navegador
                   (proyecto principal)  (migraciones punto-2)
```

| Punto | Persistencia | Proyecto Supabase | Carpeta de migraciones |
|---|---|---|---|
| 1 | Supabase | #1 (principal, conectado a GitHub) | `databases/punto-1/supabase` |
| 2 | PostgreSQL en el navegador (PGlite) con las migraciones de `databases/punto-2` | — (sin servidor) | `databases/punto-2/supabase` |
| 3 | Solo frontend (Zustand) | — | — |

## 2. Capas

| Capa | Carpeta | Responsabilidad | Puede importar |
|---|---|---|---|
| Presentación | `src/features`, `src/layout`, `src/ui` | Páginas y componentes | `services`, `state`, `hooks`, `ui`, `theme` |
| Casos de uso | `src/services` | Orquesta reglas + datos (`runAsignacion()`, `registrarNota()`) | `domain`, `data` |
| Dominio | `src/domain` | Reglas de negocio **puras** y testeables | nada externo |
| Datos (ORM) | `src/data` | `Repository<T>` sobre supabase-js, `sqlRunner` | `@supabase/supabase-js` |
| Estado | `src/state` | Stores de Zustand (suplantación, normalización) | `domain` |

Reglas:
- **Solo `src/data/` importa supabase.** Las páginas nunca consultan la BD directamente.
- El dominio no conoce React ni supabase; recibe y devuelve tipos de TS.
- Permisos del punto 1 en un único lugar: `src/domain/punto1/permisos.ts` (rol × fase → acciones).

## 3. Estructura de carpetas

```
src/
├── main.tsx · App.tsx · router.tsx
├── theme/        tokens.ts · applyTheme.ts · global.css
├── ui/           Button/ Card/ Chip/ Input/ TextArea/ Select/ DataTable/ Tabs/ NavBar/
│                 SideNav/ Badge/ Modal/ Toast/ CodeBlock/ EmptyState/ Stat/ Stepper/  + index.ts
├── layout/       AppShell/ GlobalNav/ Footer/ SectionHeader/
├── data/         clients.ts · orm/{Repository.ts,types.ts} · punto1/*.repository.ts · punto2/sqlRunner.ts
├── domain/       punto1/* · punto2/examQueries.ts · punto3/normalizacion.ts
├── services/     punto1/*
├── state/        impersonationStore.ts · normalizacionStore.ts
├── hooks/        useAsync · useCurrentPersona · usePhase · useTable
└── features/     home/ · punto1/ · punto2/ · punto3/
```

### Componentes: patrón de 3 archivos

```
src/ui/Button/
├── Button.tsx          # componente (sin lógica de negocio)
├── Button.module.css   # estilos, solo var(--…)
└── Button.types.ts     # props y variantes tipadas
```

Los barrels (`index.ts`) existen solo a nivel de carpeta (`src/ui/index.ts`), no por componente.
Los archivos de prueba (`X.test.tsx`) pueden vivir junto al componente y no cuentan en la regla de 3 archivos.

## 4. Sistema de diseño

`src/theme/tokens.ts` es la **única** fuente de valores; `applyTheme.ts` los expone como variables CSS:

| Grupo | Variables | Ejemplo |
|---|---|---|
| Color | `--color-primary`, `--color-body`, `--color-mute`, `--color-canvas`, `--color-canvas-soft`, … | `#000000`, `#5e5e5e` |
| Tipografía | `--type-<token>` (shorthand: `font: var(--type-body-md)`), `--type-<token>-size`, `--font-display/text/mono` | Inter 700 / 400–500 |
| Espaciado | `--space-xxs` … `--space-3xl` | 4 → 32 px |
| Bordes | `--radius-md`, `--radius-xl`, `--radius-pill`, `--radius-pill-tab` | 8, 16, 999, 36 px |
| Sombras | `--shadow-level1`, `--shadow-level2`, `--shadow-level3` | niveles de DESIGN.md |
| Otros | `--border-*`, `--size-*` (container, side-nav, modal, control-height…), `--motion-*`, `--z-*` | |

Reglas visuales:
- Blanco/negro; botón primario = píldora negra. Elementos interactivos: `--radius-pill`. Tarjetas: `--radius-xl`.
- **Excepción documentada:** estados (éxito/advertencia/error) en escala de grises + icono, sin color de acento.

## 5. Datos

- **Repository<T>** (`findAll`, `findBy`, `findOne`, `getOne`, `count`, `insert`, `update`, `remove`); errores normalizados a `DataError` (`not_configured`, `not_found`, `query_failed`, `network`). `update`/`remove` sin filtros se rechazan.
- **Sin credenciales** la app no falla: `SupabaseGuard` muestra qué variables faltan en `.env.local`.
- **Pruebas:** `src/data/testing/fakeSupabase.ts` simula el cliente y registra la cadena de llamadas.
- **Punto 2:** PostgreSQL real en el navegador (PGlite, carga diferida). `localDb.ts` aplica las migraciones de `databases/punto-2` (importadas con `?raw`) y ejecuta como `anon`; `run_sql` (invoker, `search_path = examen`, timeout 3 s, solo DML/SELECT) y `reset_data` (definer).
- **Datos semilla en migraciones:** Supabase no aplica `seed.sql` en producción; `seed.sql` solo sirve para ramas de vista previa.

## 6. Suplantación (punto 1)

- No hay autenticación real. `impersonationStore` (persistido en localStorage) guarda la persona activa.
- `PersonaSwitcher` permite cambiar de persona con un clic; `RoleNav` muestra las acciones de ese rol, deshabilitadas con motivo si la fase actual no las permite.

## 7. Calidad

- `npm run typecheck && npm run lint && npm test && npm run build`.
- Vitest para `domain/` (reglas) y `data/orm` (con cliente simulado).
- **PGlite** (Postgres en WebAssembly) para probar las migraciones reales: `src/test/pglite.ts` aplica `databases/<punto>/supabase/migrations` en memoria (con los tipos que devuelve PostgREST) y `src/test/pgliteSupabase.ts` es un cliente supabase-js mínimo que traduce a SQL lo que usa `src/data` (select/eq/is/in/order/limit, insert, upsert, update, delete, count y rpc). Así servicios y páginas se prueban de punta a punta sin Supabase.
- Rutas pesadas con carga diferida (`lazy` en `router.tsx`): supabase-js solo se descarga al abrir un punto que lo usa.
- Comprobaciones con grep: sin hex/px en `*.module.css`; 3 archivos por componente; sin `supabase` fuera de `src/data/`.
