# AGENTS.md — Convenciones de trabajo

Guía para que cualquier modelo de IA continúe trabajando con la documentación
de esta carpeta de forma consistente. **Léelo siempre antes de hacer cambios.**

## Contexto

- **Asignatura:** Bases de Datos I (IS644)
- **Universidad:** Universidad Tecnológica de Pereira (UTP)
- **Programa:** Ingeniería de Sistemas y Computación
- **Texto guía:** Connolly & Begg — *Sistemas de Bases de Datos* (4ª ed.)
- **Fuente de verdad:** `curso/syllabus.md` (programa oficial de la asignatura)
- **Docente:** Iván Alexander Laverde G. (Profesional Universitario, Gestión de
  Tecnologías Informáticas y Sistemas de Información, UTP)

## Rol

Actuamos como **compañero de estudio (student buddy)** del estudiante. El objetivo
es generar documentación de estudio clara, completa y bien estructurada.

## Estructura de carpetas

```
utp-base-de-datos/
├── AGENTS.md          # Este archivo (convenciones)
├── CLAUDE.md          # Memoria/bitácora del agente (actualizar cada iteración)
├── docs/              # Documentación del PROYECTO (app del examen final)
│   ├── PLAN.md        # Plan ejecutable por fases
│   ├── PROMPT.md      # Prompt del usuario (actualizar cada iteración)
│   └── examen/        # Enunciado, DESIGN.md (Uber), imágenes, PDF
├── curso/             # Material de CLASE
│   ├── syllabus.md    # Programa oficial de la asignatura
│   └── docs/          # Apuntes de estudio por unidad/tema y talleres SQL
├── databases/         # Migraciones Supabase (punto-1, punto-2)
└── src/               # App React (Vite + TS)
```

- Los apuntes de estudio van en `curso/docs/`.
- Un archivo `.md` por tema/unidad, con nombres descriptivos
  (ej: `curso/docs/unidad-1-sgbd.md`).
- `curso/docs/README.md` sirve de índice de la documentación de clase.

## Convenciones de la app (examen final)

- Plan y estado: [docs/PLAN.md](docs/PLAN.md) y [CLAUDE.md](CLAUDE.md).
- Arquitectura: [docs/arquitectura.md](docs/arquitectura.md).
- Cada componente = 3 archivos: `X.tsx`, `X.module.css`, `X.types.ts`.
- Estilos solo con variables de `src/theme/` (`var(--…)`); nada de colores/px fijos en CSS modules.
- Capas: `features` (UI) → `services` (casos de uso) → `domain` (reglas puras) + `data` (ORM sobre supabase-js).
- UI y documentación en español; identificadores de código en inglés.

## Reglas de documentación (markdown)

1. **Todos los documentos se escriben en español**, el idioma de la asignatura.
2. Usar encabezados jerárquicos (`#`, `##`, `###`) claros.
3. Incluir al inicio de cada documento: título, unidad/tema, semana(s)
   relacionada(s) según `syllabus.md` y referencias del libro guía.
4. Tablas markdown para datos estructurados (comparaciones, comandos, etc.).
5. Bloques de código para SQL y ejemplos, indicando el lenguaje
   (```sql, ```bash, etc.).
6. Incluir ejemplos prácticos y preguntas de repaso al final de cada tema.
7. Enlazar unidades relacionadas entre sí (ej: normalización enlaza con
   diseño lógico).

## Diagramas con Excalidraw

- Los diagramas conceptuales (modelo E/R, arquitectura, flujos, etc.) se
  dibujan con **Excalidraw** usando archivos `.excalidraw`.
- Carpeta sugerida: `curso/docs/diagrams/`.
- Regla de estilo visual: usar un solo color de borde para elementos del mismo
  tipo, fondo blanco, tipografía legible y texto en español.
- Cada diagrama se referencia desde el `.md` correspondiente con un enlace
  relativo: `![Modelo E/R](diagrams/ejemplo.excalidraw.svg)`.
- Preferir exportar el diagrama a SVG junto al `.excalidraw` para poder
  visualizarlo en markdown.

## Flujo de trabajo recomendado

1. **Leer** `AGENTS.md` y el fragmento relevante de `curso/syllabus.md`.
2. Verificar si ya existe documentación del tema en `curso/docs/`.
3. Crear o actualizar la documentación siguiendo estas convenciones.
4. Para diagramas, usar Excalidraw y exportar SVG.
5. Enlazar con unidades relacionadas.

## Recordatorios

- No eliminar ni modificar `curso/syllabus.md` (es la fuente oficial).
- Mantener la consistencia de nombres y estilos entre archivos.
- Si una versión nueva del syllabus cambia temas, reflejarlo en `curso/docs/README.md`.

## Normas de la asignatura

- **Dispositivos electrónicos:** no se permiten durante exámenes ni en las
  presentaciones de estos; su uso implica nota de cero (0).
- **Entregas:** las tareas y trabajos deben entregarse **a mano** (con
  bolígrafo/manuscritas), salvo los talleres que requieran computador (lo cual
  define el docente).
- En los exámenes, los maletines/morrales se dejan donde el docente lo defina y
  quienes tengan cabello largo deben recogerlo para dejar visibles las orejas.
