# Especificación — Punto 2: Consultas sobre la BD de películas (StayHome)

- **Punto del examen:** 2 ([enunciado](examen/exam.md); esquema en [Imagen1](examen/Imagen1.jpg) e [imagen2](examen/imagen2.jpg))
- **Unidad / semanas:** Unidad 5 (SQL), semanas 10–13 según [syllabus](../curso/syllabus.md)
- **Libro guía:** Connolly & Begg, caps. 6–7 (SQL DML)
- **Relacionado:** talleres de [curso/docs/unidad4-algebra-relacional](../curso/docs/unidad4-algebra-relacional/)

---

## 0. Implementación

| Pieza | Archivo |
|---|---|
| Migración (tablas + datos + `baseline` + funciones) | [`databases/punto-2/supabase/migrations/20261004010000_examen_dvd.sql`](../databases/punto-2/supabase/migrations/20261004010000_examen_dvd.sql) |
| Respuestas a–e (datos puros) | [`src/domain/punto2/examQueries.ts`](../src/domain/punto2/examQueries.ts) |
| Casos de uso | [`src/services/punto2/punto2Service.ts`](../src/services/punto2/punto2Service.ts) |
| Acceso a datos (RPC) | [`src/data/punto2/sqlRunner.ts`](../src/data/punto2/sqlRunner.ts) |
| Página | `src/features/punto2/` (Punto2Page, ExamPointCard, SqlConsole, TablesPanel, ResultView) |
| Pruebas con Postgres real (PGlite) | `src/domain/punto2/examQueries.test.ts`, `src/features/punto2/Punto2Page/Punto2Page.test.tsx` |

**Esquemas.** La BD #2 (`mrxycubenuuobfkqvzbt`) ya tiene las tablas DreamHome de clase en `public` (incluido otro `staff`),
así que las 11 tablas del examen viven en el esquema **`examen`**, con una copia intacta en **`baseline`**. `public` no se toca.

**Funciones (RPC):**

| Función | Qué hace | Seguridad |
|---|---|---|
| `punto2_tables()` | Devuelve las 11 tablas en un JSON (una sola llamada) | Invoker (anon): solo lectura de `examen` |
| `run_sql(statements text[])` | Ejecuta las sentencias en orden, en una transacción; devuelve `{rows, rowCount}` de la última | Invoker (anon), `search_path = examen, public`, timeout 3 s, solo SELECT/WITH/INSERT/UPDATE/DELETE, una sentencia por elemento |
| `reset_data()` | Restaura `examen` desde `baseline` | Definer, `search_path = ''`, solo toca `examen` |

`anon` no tiene acceso a `baseline`; `examen` no está expuesto en la Data API (solo se llega por estas funciones).
Las columnas se guardan en minúsculas (`catalogNo` → `catalogno`), como hace PostgreSQL con identificadores sin comillas.

## 1. Tablas (sin llaves foráneas: el esquema no está relacionado ni normalizado)

| Tabla | Columnas | Filas |
|---|---|---|
| `distributioncenter` | dCenterNo, dStreet, dCity, dState, dZipCode, mgrStaffNo | 4 |
| `staff` | staffNo, name, position, salary, eMail, dCenterNo | 6 |
| `dvd` | catalogNo, title, genre, rating | 6 |
| `actor` | actorNo, actorName | 6 |
| `dvdactor` | actorNo, catalogNo, character | 7 |
| `member` | memberNo, mFName, mLName, mStreet, mCity, mState, mZipCode, mEMail, clave, mTypeNo, dCenterNo | 4 |
| `tipomembrecia` | mTypeNo, mTypeDesc, maxRentals, cargoMes | 3 |
| `deseo` | memberNo, catalogNo, ranking | 5 |
| `alquiler` | deliveryNo, memberNo, fechaSalida | 4 |
| `dvdrental` | deliveryNo, DVDNo, fechaEntrega | 4 |
| `dvdcopy` | DVDNo, disponible, catalogNo, dCenterNo | 4 |

Los datos completos están en la migración (transcritos de las imágenes).

## 2. Interfaz

- **Panel de tablas:** todas las tablas siempre visibles (tarjetas plegables con su número de filas); se recargan después de cada ejecución.
- **Puntos del examen (a–e):** cada tarjeta muestra la pregunta, el SQL, el equivalente en supabase-js, la explicación, el resultado y un botón **Ejecutar**. Los puntos d y e piden confirmación y ofrecen **Restablecer datos**.
- **Consola SQL:** SQL real (varias sentencias separadas por `;` al final de línea), Ctrl+Enter para ejecutar, tabla de resultados, tiempo de ejecución e historial de las últimas 10 consultas.

## 3. Respuestas

### a. Películas en DVD con sus actores y el personaje de cada uno

```sql
SELECT d.title, a.actorName, da.character
  FROM dvd d
  JOIN dvdactor da ON da.catalogNo = d.catalogNo
  JOIN actor a     ON a.actorNo   = da.actorNo
 ORDER BY d.title, a.actorName;
```

### b. Películas alquiladas, cuáles no se han devuelto y quién las alquiló

```sql
SELECT d.title, c.dvdNo,
       m.mFName || ' ' || m.mLName AS alquilado_por,
       al.fechaSalida, r.fechaEntrega,
       CASE WHEN r.fechaEntrega IS NULL THEN 'No devuelta' ELSE 'Devuelta' END AS estado
  FROM alquiler al
  JOIN member m    ON m.memberNo   = al.memberNo
  JOIN dvdrental r ON r.deliveryNo = al.deliveryNo
  JOIN dvdcopy c   ON c.dvdNo      = r.dvdNo
  JOIN dvd d       ON d.catalogNo  = c.catalogNo
 ORDER BY estado DESC;
```

Resultado esperado: *War of the Worlds* (copia 17864331), alquilada por Serena Parker, sin devolver.

### c. ¿Cuánto gana la empresa al mes?

```sql
SELECT SUM(t.cargoMes) AS ingreso_mensual
  FROM member m
  JOIN tipomembrecia t ON t.mTypeNo = m.mTypeNo;
```

Resultado esperado: **51.96** (14.99 + 14.99 + 11.99 + 9.99).

### d. Habeas data: eliminar toda la información de Serena Parker

```sql
DELETE FROM deseo
 WHERE memberNo IN (SELECT memberNo FROM member WHERE mFName = 'Serena' AND mLName = 'Parker');

DELETE FROM dvdrental
 WHERE deliveryNo IN (SELECT deliveryNo FROM alquiler
                       WHERE memberNo IN (SELECT memberNo FROM member
                                           WHERE mFName = 'Serena' AND mLName = 'Parker'));

DELETE FROM alquiler
 WHERE memberNo IN (SELECT memberNo FROM member WHERE mFName = 'Serena' AND mLName = 'Parker');

DELETE FROM member WHERE mFName = 'Serena' AND mLName = 'Parker';
```

El orden importa: primero los registros dependientes y al final el miembro. Resultado esperado: quedan 3 miembros.

### e. Aumento de sueldo: 2 % a quien gana más que el promedio y 3 % a quien gana menos

```sql
UPDATE staff
   SET salary = CASE
                  WHEN salary > (SELECT AVG(salary) FROM staff) THEN salary * 1.02
                  ELSE salary * 1.03
                END;
```

El promedio es 42 000. Art Peters (S0415) gana exactamente el promedio y queda en 43 260
(recibe el 3 %; ver [preguntas abiertas](preguntas-abiertas.md)).

## 4. Seguridad de la consola

- `run_sql` se ejecuta con el rol `exam_runner`: solo SELECT/INSERT/UPDATE/DELETE sobre `public`, sin DDL.
- Se rechaza cualquier acceso a `baseline` y a los esquemas del sistema; *timeout* de 3 s.
- `reset_data()` restaura todas las tablas desde el esquema `baseline`.

## 5. Preguntas de repaso

1. ¿Por qué en el punto d hay que borrar en un orden determinado aunque no existan FKs?
2. ¿Por qué la subconsulta `AVG(salary)` del punto e se evalúa con los valores **anteriores** al UPDATE?
3. ¿Qué cambiaría en b si se usara `LEFT JOIN` desde `dvdcopy`?
