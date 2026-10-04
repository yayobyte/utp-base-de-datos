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
                  services/punto1    data/punto2/sqlRunner   state/normalizacionStore
                    │        │              │                  │
             domain/punto1  data/punto1   RPC run_sql      domain/punto3
                              │              │
                     Supabase BD #1     Supabase BD #2
                   (proyecto principal)  (películas/DVD)
```

| Punto | Persistencia | Proyecto Supabase | Carpeta de migraciones |
|---|---|---|---|
| 1 | Supabase | #1 (principal, conectado a GitHub) | `databases/punto-1/supabase` |
| 2 | Supabase | #2 | `databases/punto-2/supabase` |
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

## 4. Sistema de diseño

`src/theme/tokens.ts` es la **única** fuente de valores; `applyTheme.ts` los expone como variables CSS:

| Grupo | Variables | Ejemplo |
|---|---|---|
| Color | `--color-primary`, `--color-body`, `--color-mute`, `--color-canvas`, `--color-canvas-soft`, … | `#000000`, `#5e5e5e` |
| Tipografía | `--font-display`, `--font-text`, `--text-display-xl-size`, … | Inter 700 / 400–500 |
| Espaciado | `--space-xxs` … `--space-3xl` | 4 → 32 px |
| Bordes | `--radius-md`, `--radius-xl`, `--radius-pill`, `--radius-pill-tab` | 8, 16, 999, 36 px |
| Sombras | `--shadow-1`, `--shadow-2`, `--shadow-3` | niveles de DESIGN.md |

Reglas visuales:
- Blanco/negro; botón primario = píldora negra. Elementos interactivos: `--radius-pill`. Tarjetas: `--radius-xl`.
- **Excepción documentada:** estados (éxito/advertencia/error) en escala de grises + icono, sin color de acento.

## 5. Datos

- **Repository<T>** (`findAll`, `findBy`, `findOne`, `insert`, `update`, `remove`); errores normalizados a `DataError`.
- **Punto 2:** `run_sql(statements text[])` y `reset_data()` son funciones `SECURITY DEFINER` que se ejecutan con el rol `exam_runner` (solo DML sobre `public`) y tienen un *timeout* de 3 s.
- **Datos semilla en migraciones:** Supabase no aplica `seed.sql` en producción; `seed.sql` solo sirve para ramas de vista previa.

## 6. Suplantación (punto 1)

- No hay autenticación real. `impersonationStore` (persistido en localStorage) guarda la persona activa.
- `PersonaSwitcher` permite cambiar de persona con un clic; `RoleNav` muestra las acciones de ese rol, deshabilitadas con motivo si la fase actual no las permite.

## 7. Calidad

- `npm run typecheck && npm run lint && npm test && npm run build`.
- Vitest para `domain/` (reglas) y `data/orm` (con cliente simulado).
- Comprobaciones con grep: sin hex/px en `*.module.css`; 3 archivos por componente; sin `supabase` fuera de `src/data/`.
