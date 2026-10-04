# Despliegue — Vercel + Supabase (integración con GitHub)

- **Referencia:** [Supabase — GitHub integration](https://supabase.com/docs/guides/deployment/branching/github-integration)
- **Relacionado:** [arquitectura.md](arquitectura.md) · [PLAN.md](PLAN.md), fase 8

## 1. Estructura esperada por Supabase

Cada proyecto tiene su propio directorio de trabajo que contiene una carpeta `supabase/`:

```
databases/
├── punto-1/supabase/   config.toml · migrations/ · seed.sql   → proyecto #1 (principal)
└── punto-2/supabase/   config.toml · migrations/ · seed.sql   → proyecto #2 (películas)
```

- Al desplegar a producción solo se aplican las **migraciones nuevas** (y funciones o buckets declarados en `config.toml`).
- **`seed.sql` no se aplica en producción**: los datos del examen van en una migración. `seed.sql` solo sirve para las ramas de vista previa.

## 2. Supabase: proyecto #1 (principal)

1. `npx supabase init --workdir databases/punto-1` (si la carpeta no existe).
2. `npx supabase link --project-ref <REF_1> --workdir databases/punto-1`.
3. Dashboard → *Project Settings* → *Integrations* → *GitHub*:
   - Repositorio: este repositorio.
   - **Working directory:** `databases/punto-1`.
   - Activar **Deploy to production** (rama `master`).
   - Opcional: **Automatic branching** con "Supabase changes only".

## 3. Supabase: proyecto #2 (películas)

Mismos pasos, con `--workdir databases/punto-2` y working directory `databases/punto-2`.

> La documentación de Supabase no dice si dos proyectos pueden conectarse al mismo repositorio.
> Si el dashboard no lo permite, se despliega a mano:
> `npx supabase db push --workdir databases/punto-2`.

## 4. Vercel

1. *Add New Project* → importar el repositorio. Framework: **Vite**. Root directory: `.`.
2. Variables de entorno:

| Variable | Valor |
|---|---|
| `VITE_P1_SUPABASE_URL` | URL del proyecto #1 |
| `VITE_P1_SUPABASE_ANON_KEY` | anon key del proyecto #1 |
| `VITE_P2_SUPABASE_URL` | URL del proyecto #2 |
| `VITE_P2_SUPABASE_ANON_KEY` | anon key del proyecto #2 |

3. `vercel.json` reescribe todas las rutas a `index.html` (SPA).

## 5. Verificación

- Hacer push de una migración nueva y comprobar que aparece en el dashboard de Supabase.
- La URL de vista previa de Vercel debe cargar los tres puntos.
