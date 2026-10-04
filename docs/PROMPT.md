I have to work on this task. This is a final exam I have to to to skip classes during this semester, In this repo, we have done some similar with a similar database. I want you create the md files fot this architecture. There are some folders already in the repo, you can resctructure them as you find convenience and create a proper folder structure for this project, this is a classrom that will contain a main project created in ReactJs (will give you the tech stack later on) and supabase connectivity (will also give you the specs in a bit) so we can probably organize the project as in main folder and a sub folder the the current classes and information.
Make sure you update this file in every iteration and also create a claude.md file so the agent can remember always every step taken. 

For this first iteration in plan mode, create a proper AI executable plan and then later on using that new file change the effor of the agent to low so it can easily execute the tasks and consuming less tokens. If not possible, create the plan so I can change the effort level and click on execute the plan 

The final exam is located in @exam/exam.md

**ARCHITECTURAL REQUIREMENT**

Use the @exam/DESIGN.md file to get the design system information from uber but create main UI elements for this purpose and put them in a UI folder which every subfolder will contain every element

**DESIGN REQUIREMENT**

Use the file @exam/DESIGN.md
which the system will contain the UBER design system provided by getdesign team
https://getdesign.md/uber/design-md


**FUNCTIONAL REQUIREMENTS**

So for this initial functional requirements. lets do this in a website to be deployed to vercel and supabase. CHeck this website about the supabase migration so we can properly connect github to supabase https://supabase.com/docs/guides/deployment/branching/github-integration


*NAVIGATION*

THe website will contain 3 points: Each corresponding to what is there in the @exam/exam.md file. Lets create a simple navigation to show the 3 points of the exam 

*FUNCTIONALITY POINT 1*
SO for this point specifically we are going to make a full system to the users to perform this operations, this will have its own navigation system so the global one to select between the three points of the exam can be a simpler one and this navigation system to be more complex and more intentional to solve this particular problem. Make the system so I can inpersonate each individual of the process by clicking to one button and then creating the available processes that that particular user can perform, if there are open questions you have based on this requirement, let me know so I can give you in the prompt and make sure to update the document. also create another document based on specifications that I can follow up later on the design is completed


*FUNCTIONALITY POINT 2*

For this we only need to show the database information in a UI containing all the tables as the tables are not relationed now and they are not normalized we still need to have a filed that simulates supabase query system that I can still run queries trough them. Also a place where says the exams points and I can run them and show the query performed, invent a way to showcase this in a proper way to the users.
The tables should always be visible with the data, as the tables are not that much we can still have a place to show the data so we can easily query them.

*FUNCTIONALITY POINT 3*

For this point, the requirement is pretty simple, we will normalize this database to the point is required based on the document so, showcase each step and how this is going to be converted in another database or table so I can explain to the audience

**DATABASE REQUIREMENTS**

Based on this exam, we will have to use 2 databases, one for the point 1 and another for the point 2. the third point will only use the frontend state manager to create the normalization of that table but no database storage
The point 1 will be the main database which will be used as the project integration and the 2nd database I will create another database in supabase anb give you the connection details so it can be used.

**TECH STACK**

For this requirement lets create a react app based using vite and vercel configuration, also use supabase and check the requirement for supabase to do migration. 
make it typescript ready and also reparate styles from files, so per each component we will have 3 files,
make components small, consistent and easy to maintain,
keep one layer of abstaction for the business rules, so make it easy to work based on each user requirement and based on each point of the document you create for the user requirements.
make another layer of abstaction to query from the database, similar to an orm.
create a proper folder structure for an app like this separating each component.
make sure you handle the user impersonation.
use a file for the general typography and design system configuration so common styles are reused and not hardcoded per each individual file, create a theme file containing typography, spacing system, border configuration, shadowing, and color.
---

## Iteraciones

### Iteración 1 — 2026-10-04: plan + estructura

- Plan aprobado → [docs/PLAN.md](PLAN.md). Fase 0 ejecutada.
- Decisiones: app en la raíz y clases en `curso/`; consola SQL real vía RPC; modelo del punto 1 = fusión de `curso/docs/punto-1-modelado-utp.md` y `docs/examen/spec-punto-1-agents.md`; personas = Estudiante, Docente, Admin.
- Rutas nuevas: `exam/` → `docs/examen/`, este archivo → `docs/PROMPT.md`.
- Corrección: el primer encabezado "FUNCTIONALITY POINT 3" correspondía al punto 1.
- Pendiente: credenciales de Supabase (BD1/BD2), [preguntas abiertas](preguntas-abiertas.md).
- Siguiente: bajar el esfuerzo a *low* y pedir "Ejecuta docs/PLAN.md fase 1".

### Iteración 2 — 2026-10-04: fase 1 (scaffold)

- App Vite + React 19 + TS en la raíz; dependencias y scripts instalados; `vercel.json` y `.env.example`.
- Lint con oxlint (plantilla actual de Vite).
- Siguiente: "Ejecuta docs/PLAN.md fase 2" (tema + kit UI).

### Iteración 3 — 2026-10-04: fase 2 (tema + kit UI)

- `src/theme/tokens.ts` con los valores de DESIGN.md → variables CSS vía `applyTheme()`.
- 17 elementos en `src/ui/` (3 archivos cada uno) y página de muestra en `/ui` (solo `npm run dev`).
- Siguiente: "Ejecuta docs/PLAN.md fase 3" (shell + navegación global + inicio).

### Iteración 4 — 2026-10-04: fase 3 (shell + navegación)

- Navegación global simple con los 3 puntos (`src/layout/navigation.ts`), inicio con 3 tarjetas, pie negro, 404.
- Los puntos muestran una página provisional hasta su fase (5, 6, 7).
- Siguiente: "Ejecuta docs/PLAN.md fase 4" (capa de datos / ORM).

### Iteración 5 — 2026-10-04: fase 4 (capa de datos)

- ORM ligero sobre supabase-js (`Repository<T>`), errores `DataError`, ejecutor SQL del punto 2 (RPC `run_sql` / `reset_data`).
- Sin credenciales, las páginas muestran "Configura .env.local" con las variables que faltan.
- Siguiente: fase 5 (punto 2) — la migración y la UI se pueden escribir ya; para probar contra la BD real se necesitan URL, anon key y project ref de la BD #2. Alternativa sin credenciales: fase 7 (punto 3).

### Iteración 6 — 2026-10-04: despliegue primero (Vercel + Supabase)

- Pedido: conectar Vercel y Supabase antes de la fase 5 para asegurar que el despliegue funciona.
- Repo preparado: carpetas Supabase de las 2 BD, migración `health`, página `/estado`, `vercel.json` completo.
- Pasos manuales en dashboards: [docs/despliegue.md](despliegue.md). Verificación: `/estado` → "Todo funciona".
