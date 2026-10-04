# Examen Final — Bases de Datos I (IS644, UTP)

Aplicación web que resuelve los tres puntos del examen final
([enunciado](docs/examen/exam.md)) y repositorio del material de la asignatura.

| Punto | Tema | Qué muestra la app |
|:---:|---|---|
| 1 | Modelado E-ER: registro de notas UTP | Sistema funcional; se puede suplantar a Estudiante, Docente o Admin y ejecutar sus procesos. BD Supabase #1. |
| 2 | Consultas: películas, actores y alquileres | Todas las tablas visibles, consola SQL y respuestas a–e ejecutables. BD Supabase #2. |
| 3 | Normalización de la tabla `Préstamo` | Paso a paso 0FN → 1FN → 2FN → 3FN (solo frontend). |

**Stack:** Vite + React + TypeScript · Supabase · Vercel · Zustand · diseño basado en
[DESIGN.md (Uber)](docs/examen/DESIGN.md).

## Documentación del proyecto

- [Plan ejecutable por fases](docs/PLAN.md) · [Memoria del agente](CLAUDE.md) · [Convenciones](AGENTS.md)
- [Arquitectura](docs/arquitectura.md) · [Despliegue](docs/despliegue.md) · [Preguntas abiertas](docs/preguntas-abiertas.md)
- Especificaciones: [Punto 1](docs/especificacion-punto-1.md) · [Punto 2](docs/especificacion-punto-2.md) · [Punto 3](docs/especificacion-punto-3.md)

## Material de clase

Todo el material de la asignatura está en [`curso/`](curso/):
[syllabus](curso/syllabus.md) · [índice de apuntes](curso/docs/README.md) ·
[libro guía](curso/docs/libro-guia-connolly-begg.md) ·
[talleres SQL (unidad 4)](curso/docs/unidad4-algebra-relacional/).

## Desarrollo

> Disponible a partir de la fase 1 del plan.

```bash
npm install
cp .env.example .env.local   # completar credenciales de Supabase
npm run dev
```
