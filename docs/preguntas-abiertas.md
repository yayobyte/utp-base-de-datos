# Preguntas abiertas

Responde debajo de cada pregunta (o en el prompt). Cuando una pregunta quede resuelta, se pasa a
*Decisiones tomadas* en [CLAUDE.md](../CLAUDE.md).

| # | Punto | Pregunta | Propuesta | Respuesta |
|---|---|---|---|---|
| 1 | 1 | El Admin también hace el trabajo del Director (franjas, máximo de grupos, asignar docentes). ¿Está bien o se agrega el rol Director más adelante? | Admin asume las tareas del Director | Aceptada (2026-10-04) |
| 2 | 1 | No hay autenticación real: solo suplantación y RLS abierta para `anon`. ¿Es aceptable para la presentación? | Sí | Aceptada (2026-10-04) |
| 3 | 1 | ¿La fecha o semana simulada la controla el Admin o se usa la fecha real? | Controlada por el Admin | Aceptada (2026-10-04) |
| 4 | 1 | "Fuera por un semestre" no está entre las subclases de AGENTS.ms (Normal, Prueba, Transición, Fuera). ¿Se agrega como 5.º estado? | Sí, como subtipo de *fuera* con `hasta_periodo` | Aceptada: `estudiante_fuera.hasta_periodo` |
| 5 | 1 | "En bloque": ¿es un indicador del estudiante o se deriva del semestre del plan? | Indicador (`en_bloque`) | Aceptada (2026-10-04) |
| 6 | 2 | Punto e: ¿quien gana exactamente el promedio recibe el 3 % o no recibe aumento? | 3 % | |
| 7 | 2 | Punto d: ¿la copia que tiene Serena (17864331) se marca disponible después de borrarla? | Sí, `disponible = 'Y'` | |
| 8 | 2 | ¿El botón "Restablecer datos" se muestra a todos o solo en un "modo presentador"? | Visible para todos | |
| 9 | 3 | ¿El profesor espera FNBC/4FN o basta con 3FN? | 3FN + nota sobre FNBC | |
| 10 | Infra | URL, anon key y project ref de las BD #1 y #2; nombre del proyecto en Vercel | — | |
