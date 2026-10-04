# Despliegue — Vercel + Supabase (integración con GitHub)

- **Referencia:** [Supabase — GitHub integration](https://supabase.com/docs/guides/deployment/branching/github-integration)
- **Relacionado:** [arquitectura.md](arquitectura.md) · [PLAN.md](PLAN.md), fase 8
- **Repositorio:** `github.com/yayobyte/utp-base-de-datos` · rama de producción `master`

---

## 0. Qué ya está listo en el repo

| Pieza | Archivo |
|---|---|
| Configuración de Vercel (Vite, `npm ci`, `dist`, SPA) | [`vercel.json`](../vercel.json) |
| Versión de Node para el build (`>=22.12`) | `package.json` → `engines` |
| Variables de entorno de ejemplo | [`.env.example`](../.env.example) |
| Proyecto Supabase #1 (working directory) | `databases/punto-1/supabase/` |
| Proyecto Supabase #2 (working directory) | `databases/punto-2/supabase/` (puertos locales 553xx para no chocar con el #1) |
| Migración de verificación en ambos | `migrations/20261004000000_health.sql` → `public.health()` |
| Página de diagnóstico | `/estado` (enlace en el pie de página) |

`public.health()` devuelve `{ ok, punto, version, migraciones, hora_servidor }`. Si `/estado` muestra la
versión `20261004000000`, la cadena completa funciona: **GitHub → Supabase (migración aplicada) → Vercel (build con
variables) → navegador**.

## 1. Crear los dos proyectos en Supabase

1. [supabase.com/dashboard](https://supabase.com/dashboard) → *New project*.
   - Proyecto #1: `examen-bd-punto-1` (región: la más cercana, p. ej. *East US* o *São Paulo*).
   - Proyecto #2: `examen-bd-punto-2`.
2. Guardar de cada uno (*Project Settings → API* / *Data API*):
   - **Project URL** (`https://<ref>.supabase.co`)
   - **anon / publishable key**
   - **Project ref** (el `<ref>` de la URL)

## 2. Conectar GitHub → Supabase (migraciones automáticas)

Para **cada** proyecto: *Project Settings → Integrations → GitHub Integration → Authorize GitHub*, y luego:

| Campo | Proyecto #1 | Proyecto #2 |
|---|---|---|
| Repository | `yayobyte/utp-base-de-datos` | `yayobyte/utp-base-de-datos` |
| **Working directory** | `databases/punto-1` | `databases/punto-2` |
| **Deploy to production** | ✅ activado | ✅ activado |
| Production branch | `master` | `master` |
| Automatic branching | opcional (requiere plan de pago para ramas) | opcional |

Notas:
- En producción solo se aplican **migraciones nuevas**; `seed.sql` **no** se aplica. Los datos del examen irán en migraciones.
- Si el dashboard no permite conectar el mismo repositorio a un segundo proyecto (no está documentado), se
  despliega el #2 a mano:

```bash
npx supabase login
npx supabase link --project-ref <REF_2> --workdir databases/punto-2
npx supabase db push --workdir databases/punto-2
```

**Comprobar:** en el SQL editor de cada proyecto, `select public.health();` debe devolver `"ok": true`.
(Si se conectó la integración *después* del último push, haz un push nuevo o usa `db push` como arriba.)

## 3. Conectar GitHub → Vercel

1. [vercel.com/new](https://vercel.com/new) → *Import Git Repository* → `yayobyte/utp-base-de-datos`.
2. Framework: **Vite** (lo toma de `vercel.json`). Root directory: `./`.
3. *Environment Variables* (marcar **Production** y **Preview**):

**BD #1:** no hay que añadir nada si se instaló la integración **Supabase ↔ Vercel** (*Supabase → Integrations →
Vercel*): crea `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y las mantiene al día. La app las
lee gracias a `envPrefix: ['VITE_', 'NEXT_PUBLIC_']` en `vite.config.ts`. Las demás variables de la integración
(`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `POSTGRES_*`…) **no** llegan al navegador porque no tienen
esos prefijos.

**BD #2** (y BD #1 si no se usa la integración), a mano:

| Variable | Valor |
|---|---|
| `VITE_P1_SUPABASE_URL` | Project URL del #1 (opcional, tiene prioridad sobre `NEXT_PUBLIC_SUPABASE_URL`) |
| `VITE_P1_SUPABASE_ANON_KEY` | publishable key del #1 (opcional) |
| `VITE_P2_SUPABASE_URL` | Project URL del #2 |
| `VITE_P2_SUPABASE_ANON_KEY` | publishable key del #2 |

Vercel muestra el aviso *"Remove the public framework prefix to keep this value private"* al crear una variable
`VITE_*`. Es correcto para URL y publishable key (son públicas por diseño): confirmar. **Nunca** poner prefijo
`VITE_` o `NEXT_PUBLIC_` a una llave secreta.

4. *Deploy*. Las variables `VITE_*` se incrustan en el build: **si se cambian, hay que volver a desplegar**
   (*Deployments → … → Redeploy*).

> La anon key es pública por diseño (va en el navegador). La seguridad está en los permisos de la BD:
> RLS y funciones `SECURITY DEFINER` con privilegios mínimos. Nunca usar la `service_role` key en la app.

## 4. Verificación de punta a punta

1. Abrir `https://<proyecto>.vercel.app/estado`.
2. Esperado:
   - Insignia **Todo funciona**.
   - Ambas tarjetas **Conectada**, *Última migración* `20261004000000`, latencia en ms.
   - Línea de build con el commit corto, rama `master` y entorno `production`.
3. Abrir `/punto-2` directamente (recargar la página) → no debe dar 404 (reescritura SPA).

| Síntoma en `/estado` | Causa probable | Solución |
|---|---|---|
| *Sin configurar* | Faltan variables `VITE_*` en Vercel | Añadirlas y **Redeploy** |
| *Error: Could not find the function public.health* | La migración no se aplicó | Revisar la integración GitHub o `db push` |
| *Error: Invalid API key* | Key de otro proyecto o `service_role` | Copiar la anon key correcta |
| *Error: Failed to fetch* | URL mal escrita o proyecto pausado | Revisar URL / reactivar el proyecto |
| Build `local` | Se está viendo el `npm run dev` local | Abrir la URL de Vercel |

## 5. Desarrollo local

```bash
cp .env.example .env.local   # pegar las URLs y anon keys
npm run dev                  # http://localhost:5173/estado
```

Base de datos local (opcional, requiere Docker en ejecución):

```bash
npx supabase start --workdir databases/punto-1
npx supabase start --workdir databases/punto-2   # puertos 553xx
```
