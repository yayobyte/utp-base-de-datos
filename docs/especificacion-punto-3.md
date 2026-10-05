# Especificación — Punto 3: Normalización de la tabla `Préstamo`

- **Punto del examen:** 3 ([enunciado](examen/exam.md))
- **Unidad / semanas:** Unidad 4 (dependencias funcionales y normalización), semanas 6–9 según [syllabus](../curso/syllabus.md)
- **Libro guía:** Connolly & Begg, caps. 14–15 (normalización)
- **Persistencia:** ninguna; estado en el frontend (Zustand)

---

## 1. Tabla original (0FN / UNF)

| CodLibro | Titulo | Autor | Editorial | NombreLector | FechaDev |
|---|---|---|---|---|---|
| 1001 | Variable compleja | Murray Spiegel | McGraw Hill | Pérez Gómez, Juan | 15/04/2005 |
| 1004 | Visual Basic 5 | E. Petroustsos | Anaya | Ríos Terán, Ana | 17/04/2005 |
| 1005 | Estadística | Murray Spiegel | McGraw Hill | Roca, René | 16/04/2005 |
| 1006 | Oracle University | Nancy Greenberg y Priya Nathan | Oracle Corp. | García Roque, Luis | 20/04/2005 |
| 1007 | Clipper 5.01 | Ramalho | McGraw Hill | Pérez Gómez, Juan | 18/04/2005 |

**Problemas:**
- `Autor` es multivaluado en el libro 1006.
- `NombreLector` es compuesto (apellidos y nombre en un solo campo).
- Hay redundancia (McGraw Hill, Murray Spiegel y Pérez Gómez se repiten), lo que produce anomalías de inserción, actualización y borrado.

## 2. 1FN — valores atómicos

- Se separan los autores del libro 1006 en dos filas (la tabla pasa a 6 filas).
- `NombreLector` se divide en `ApellidosLector` y `NombreLector`.
- PK = (CodLibro, Autor).

## 3. 2FN — eliminar dependencias parciales

DF: `CodLibro → Titulo, Editorial, ApellidosLector, NombreLector, FechaDev`. Estas columnas dependen solo de una parte de la PK.

| Tabla | Columnas | PK |
|---|---|---|
| Libro | CodLibro, Titulo, Editorial | CodLibro |
| LibroAutor | CodLibro, Autor | (CodLibro, Autor) |
| Prestamo | CodLibro, ApellidosLector, NombreLector, FechaDev | CodLibro |

## 4. 3FN — eliminar dependencias transitivas y redundancia

| Tabla | Columnas | PK | FK |
|---|---|---|---|
| Editorial | IdEditorial, Nombre | IdEditorial | — |
| Autor | IdAutor, Nombre | IdAutor | — |
| Lector | IdLector, Apellidos, Nombre | IdLector | — |
| Libro | CodLibro, Titulo, IdEditorial | CodLibro | IdEditorial → Editorial |
| LibroAutor | CodLibro, IdAutor | (CodLibro, IdAutor) | ambas |
| Prestamo | CodLibro, IdLector, FechaDev | CodLibro | ambas |

## 5. Interfaz

- **Stepper** 0FN → 1FN → 2FN → 3FN con botones anterior/siguiente.
- Tablas antes y después lado a lado; las columnas que cambian se resaltan en negrita o subrayado (sin colores de acento).
- Lista de dependencias funcionales como chips `A → B`, y la explicación de cada paso.
- **Modo sandbox:** permite editar filas de la tabla original y ver cómo se recalculan las formas normales.
- Diagrama final con cajas y etiquetas PK/FK.

## 6. Implementación

| Pieza | Archivo |
|---|---|
| Reglas (funciones puras) | [`src/domain/punto3/normalizacion.ts`](../src/domain/punto3/normalizacion.ts): `toUNF`, `to1FN`, `to2FN`, `to3FN`, `normalize` |
| Estado (Zustand, sin BD) | [`src/state/normalizacionStore.ts`](../src/state/normalizacionStore.ts): paso actual + filas editables |
| Página | `src/features/punto3/` (Punto3Page, StepView, NfTableCard, DependencyList, SchemaDiagram, SourceEditor) |
| Pruebas | `normalizacion.test.ts` (conteos por paso, FKs válidas, recálculo) y `Punto3Page.test.tsx` |

Cada paso se **calcula** desde las filas de origen (no está escrito a mano): devuelve
`{ tables, dependencias, explicacion, cambios }`. Los ids de 3FN (`E1`, `A1`, `L1`…) se asignan por orden de aparición.
Resultado con los datos del examen: 0FN 5 filas → 1FN 6 → 2FN Libro 5 · LibroAutor 6 · Prestamo 5 →
3FN Editorial 3 · Autor 5 · Lector 4 · Libro 5 · LibroAutor 6 · Prestamo 5.

## 7. Preguntas de repaso

1. ¿Qué dependencia funcional viola la 2FN en la tabla 1FN?
2. ¿Por qué crear `Editorial` y `Lector` elimina anomalías de actualización?
3. ¿La tabla final cumple FNBC?
