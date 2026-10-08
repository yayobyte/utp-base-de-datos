# Operaciones de conjuntos y `JOIN` en SQL

**Unidad:** Unidad 5 — SQL (apoyada en la Unidad 4 — Álgebra relacional)
**Semanas:** 10 – 13
**Referencia:** Connolly & Begg — *Database Systems*, cap. 6 (*SQL: Data Manipulation*)
y cap. 5 (*Relational Algebra*, operadores de conjuntos y de joins)
**Esquema de ejemplo:** RentDreamHome (`Branch`, `Staff`, `Client`, `PrivateOwner`,
`PropertyForRent`, `Viewing`, `Registration`), el mismo de los talleres de
[unidad4-algebra-relacional](../unidad4-algebra-relacional/).

---

## 1. Dos formas de combinar resultados

SQL ofrece dos familias distintas para juntar filas de tablas distintas:

| Familia | Qué hace | Se ubica entre… | Operadores |
| :--- | :--- | :--- | :--- |
| **Operadores de conjuntos** | Combina **resultados completos** (filas completas, columna a columna) | Dos `SELECT` completos | `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT` |
| **`JOIN`** | Combina **columnas** de dos o más tablas comparando claves | Tablas dentro del `FROM` | `INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS` |

Regla mental para el examen:

> `JOIN` = **más columnas**: amplía horizontalmente la información de una misma fila.
> `UNION` = **más filas**: apila información que tiene la misma forma.

---

## 2. Operaciones de conjuntos

### 2.1 Reglas obligatorias

Para que dos `SELECT` puedan combinarse con un operador de conjuntos:

1. **Mismo número de columnas** en ambas consultas.
2. **Tipos compatibles** en las columnas que se corresponden (la 1.ª con la 1.ª,
   la 2.ª con la 2.ª, etc.).
3. El **nombre y el tipo** de las columnas de salida los define **la primera**
   consulta; las siguientes solo aportan valores.
4. El operador **no** permite `ORDER BY` dentro de cada rama; el orden se aplica
   **al final**, sobre el resultado combinado.

> ⚠️ Error clásico: `SELECT fName, lName FROM Staff UNION SELECT fName FROM Client`
> → *"each UNION query must have the same number of columns"*.

### 2.2 `UNION ALL`

Devuelve **todas** las filas de ambas consultas, **conservando los duplicados**.

```sql
-- Todas las personas del sistema: empleados, clientes y propietarios
SELECT staffNo AS codigo, fName, lName, 'Empleado'    AS tipo FROM Staff
UNION ALL
SELECT clientNo,       fName, lName, 'Cliente'     FROM Client
UNION ALL
SELECT ownerNo,        fName, lName, 'Propietario' FROM PrivateOwner;
```

Ventajas:

- No necesita ordenar ni comparar filas para eliminar repetidos → **más rápida**.
- Conserva la información real de la tabla (una persona puede aparecer 3 veces
  porque tiene 3-role distintos).

### 2.3 `UNION`

Igual que `UNION ALL`, pero **elimina las filas repetidas** (equivale a aplicar
`DISTINCT` al resultado final).

```sql
-- Mismas 3 fuentes, pero sin duplicados
SELECT fName, lName, 'Persona' AS tipo FROM Staff
UNION
SELECT fName, lName, 'Persona' FROM Client
UNION
SELECT fName, lName, 'Persona' FROM PrivateOwner;
```

Coste: el SGBD debe **ordenar o usar hash** sobre el resultado para detectar
duplicados, por eso la consulta es **más lenta**. Consecuencia lógica: si dos
personas distintas comparten nombre y apellido, `UNION` las funde en una sola fila.

| | `UNION` | `UNION ALL` |
| :--- | :--- | :--- |
| Duplicados | Elimina | Conserva |
| `DISTINCT` implícito | Sí | No |
| Rendimiento | Más lenta | Más rápida |
| Caso de uso | Questions sobre **cuántos** o **listados únicos** | Concatenar datos de tablas distintas |

> 💡 **Regla práctica:** si no hay razón para eliminar duplicados, usa
> `UNION ALL`. Solo usa `UNION` cuando necesitas valores únicos.

### 2.4 `INTERSECT` y `EXCEPT` (completan el álgebra de conjuntos)

Operan sobre **columnas completas**, no sobre condiciones de la derecha
(el segundo `SELECT` no lleva `WHERE`).

```sql
-- Ciudades que tienen sucursal Y también inmuebles
SELECT city FROM Branch
INTERSECT
SELECT city FROM PropertyForRent;

-- Ciudades con sucursal pero SIN inmuebles
SELECT city FROM Branch
EXCEPT
SELECT city FROM PropertyForRent;

-- Empleados que no tienen ninguna propiedad asignada
SELECT staffNo FROM Staff
EXCEPT
SELECT staffNo FROM PropertyForRent WHERE staffNo IS NOT NULL;
```

Correspondencia con el álgebra relacional:

| SQL | Álgebra relacional | Significado |
| :--- | :--- | :--- |
| `UNION` / `UNION ALL` | `∪` | A ∪ B |
| `INTERSECT` | `∩` | A ∩ B |
| `EXCEPT` | `−` | A − B |

> 📌 **Diferencia clave:** `EXCEPT` (y `INTERSECT`) **no propagationan NULL**
> como `NOT IN` / `NOT EXISTS`. Con `NOT IN`, un `NULL` en la lista anula todo el
> resultado; con `EXCEPT`, los `NULL` se comparan como iguales entre sí.
> Cuando se mezclan operadores (`UNION` con `EXCEPT`), usa **paréntesis** para
> fijar el orden de evaluación.

### 2.5 Ordenar el resultado combinado

```sql
SELECT fName, lName, 'Empleado' AS tipo FROM Staff
UNION ALL
SELECT fName, lName, 'Cliente'  FROM Client
ORDER BY tipo, lName, fName;      -- el ORDER BY va al final, sin paréntesis
```

### 2.6 Errores frecuentes

| Error | Por qué | Solución |
| :--- | :--- | :--- |
| Distinto número de columnas | No se puede alinear el resultado | Iguala el `SELECT` con literales (`NULL AS x`, `'Texto' AS y`) |
| Alias en todas las ramas | El nombre lo define la 1.ª consulta | Alias **solo** en la primera rama |
| `ORDER BY` dentro de las ramas | Está prohibido | Un solo `ORDER BY` al final |
| Columnas de tipos incompatibles | Compara valores que no se pueden comparar | Usa `CAST` o el mismo tipo en ambas |
| Usar `UNION` esperando contar filas | `UNION` deduplica y altera el conteo | `UNION ALL` o `COUNT(DISTINCT …)` |

---

## 3. `JOIN`

### 3.1 Qué es

Un `JOIN` es un **producto cartesiano** entre las tablas del `FROM` seguido de un
**filtro** que conserva solo las filas cuya condición es verdadera.

```sql
-- INNER JOIN: solo las filas que coinciden en ambos lados
SELECT v.propertyNo, v.viewDate, v."comment", p.street, p.city
  FROM Viewing v
  JOIN PropertyForRent p ON v.propertyNo = p.propertyNo
 ORDER BY v.viewDate;
```

**Por qué `INNER` y no nada?** Sin el `ON`, `Viewing` (100 filas) x
`PropertyForRent` (15 filas) = 1500 filas inútiles. El `ON` deja solo las 100 que
realmente están relacionadas.

### 3.2 Tipos de `JOIN`

| Tipo | Qué devuelve | `NULL` en las columnas del lado sin coincidencia |
| :--- | :--- | :--- |
| `INNER JOIN` (o `JOIN`) | Solo filas que coinciden en **ambos** lados | No aparecen |
| `LEFT JOIN` | Todas las de la **izquierda** + las que coincidan | Sí, en `NULL` |
| `RIGHT JOIN` | Todas las de la **derecha** + las que coincidan | Sí, en `NULL` |
| `FULL OUTER JOIN` | Todas de **ambos** lados, coincidan o no | Sí, en `NULL` |
| `CROSS JOIN` | **Todas × todas** (producto cartesiano), sin condición | — |

```sql
-- LEFT JOIN: empleados, aunque no tengan propiedad asignada
SELECT s.staffNo, s.fName, s.lName, p.propertyNo, p.rent
  FROM Staff s
  LEFT JOIN PropertyForRent p ON s.staffNo = p.staffNo
 ORDER BY s.staffNo;

-- RIGHT JOIN: equivalente inverso (propiedades aunque no tengan empleado)
SELECT s.staffNo, s.fName, p.propertyNo, p.rent
  FROM PropertyForRent p
  RIGHT JOIN Staff s ON s.staffNo = p.staffNo
 ORDER BY s.staffNo;

-- FULL OUTER JOIN: employed sin propiedad + propiedades sin empleado
SELECT s.staffNo, p.propertyNo
  FROM Staff s
  FULL OUTER JOIN PropertyForRent p ON s.staffNo = p.staffNo;

-- CROSS JOIN: producto cartesiano explícito
SELECT b.city, p.type
  FROM Branch b
 CROSS JOIN PropertyForRent p
 WHERE p.city = b.city;
```

> 💡 `RIGHT JOIN` casi nunca se usa en la práctica: **siempre puede reescribirse
> como `LEFT JOIN` invirtiendo el orden de las tablas**. Domina esa equivalencia.

### 3.3 `ON` vs `USING`

```sql
-- Con ON (alias distintos)
FROM Staff s JOIN Branch b ON s.branchNo = b.branchNo

-- Con USING (mismo nombre de columna: se fusionan en UNA sola columna)
FROM Staff JOIN Branch USING (branchNo)
```

Con `USING`, la columna `branchNo` **aparece una sola vez** en el `SELECT`;
con `ON`, habría que calificar cada columna (`s.branchNo` y `b.branchNo`).

### 3.4 `JOIN` con tres o más tablas

Se encadenan las condiciones en el `FROM` (o con `JOIN` sucesivos), siguiendo
la ruta de las claves foráneas.

```sql
-- Cliente -> Alquiler (dvdrental no aplica; versión RentDreamHome: Registro)
SELECT c.clientNo, c.fName, c.lName, r.propertyNo, r.dateJoined
  FROM Client c
  JOIN Registration r ON c.clientNo  = r.clientNo
  JOIN Branch b      ON r.branchNo  = b.branchNo
 ORDER BY c.clientNo;
```

### 3.5 `SELF JOIN` (autounión)

Una tabla unida consigo misma, con dos alias, para comparar filas de la misma
tabla (jerarquías, pares, comparaciones).

```sql
-- Empleados que reportan a otro empleado de la misma sucursal
SELECT e.staffNo, e.lName AS empleado, j.lName AS jefe
  FROM Staff e
  JOIN Staff j ON e.staffNo = j.staffNo
 WHERE e.branchNo = j.branchNo
   AND e.lName <> j.lName;
```

### 3.6 Errores frecuentes con `JOIN`

| Error | Síntoma | Causa / solución |
| :--- | :--- | :--- |
| `JOIN` sin `ON` | Filas duplicadas masivamente | El producto cartesiano se cuela; escribe siempre `ON` |
| Columna ambigua | `column reference "staffNo" is ambiguous` | Usa el prefijo de tabla (`s.staffNo`) |
| `JOIN` en vez de `LEFT JOIN` | Faltan filas | Usaste `INNER` y lo necesitabas externo |
| Filtrar por la tabla derecha con `LEFT JOIN` | Se comporta como `INNER` | La condición del `WHERE` sobre la derecha anula el `LEFT JOIN`; muévela al `ON` |
| Claves `NULL` en la condición | No cruzan nunca | `NULL <> NULL` es desconocido en la comparación |

> ⚠️ **Trampa clásica.** Esta consulta **NO** devuelve los empleados sin
> propiedad:
> ```sql
> SELECT s.staffNo, p.propertyNo
>   FROM Staff s
>   LEFT JOIN PropertyForRent p ON s.staffNo = p.staffNo
>  WHERE p.propertyNo IS NOT NULL;   -- <- esto la convierte en INNER JOIN
> ```
> Para detectarlos, filtra por la **tabla izquierda**:
> `WHERE p.propertyNo IS NULL`.

---

## 4. `JOIN` vs `UNION`: tabla resumen

| Pregunta | `JOIN` | `UNION` |
| :--- | :--- | :--- |
| ¿Qué une? | Columnas de tablas distintas | Filas de consultas distintas |
| ¿Cómo se relacionan? | Por una condición (`ON`) | Por **posición** (1.ª con 1.ª) |
| ¿Puede duplicar filas? | Sí, si un valor de la derecha tiene varias coincidencias | Sí con `UNION ALL` |
| ¿Necesita columnas del mismo nombre? | No | No, pero sí del mismo **número** y **tipo** |
| ¿Requiere clave foránea? | Recomendable (datos coherentes) | No: solo estructura |

**Caso de uso típico de `UNION ALL`:** cuando la información vive en tablas
distintas pero **con la misma forma** (empleados, clientes y propietarios;
o una tabla de `2019` y otra de `2020`).

---

## 5. Talleres relacionados

Estos ejercicios de [`curso/docs/unidad4-algebra-relacional`](../unidad4-algebra-relacional/)
aplican todo lo anterior:

| Archivo | Ejercicios relacionados |
| :--- | :--- |
| [`taller-consultas-complejas.sql`](../unidad4-algebra-relacional/taller-consultas-complejas.sql) | Puntos 1, 2, 5, 6, 8: `INNER`, `LEFT` y `JOIN` encadenados |
| [`taller-en-clase-2.sql`](../unidad4-algebra-relacional/taller-en-clase-2.sql) | Punto 10: `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT` |
| [`taller2-consultas-intermedias.sql`](../unidad4-algebra-relacional/taller2-consultas-intermedias.sql) | Puntos 5 y 7: `UNION ALL` y su alternativa con `NOT IN` |
| [`rent-dream-home.sql`](../unidad4-algebra-relacional/rent-dream-home.sql) | Esquema base (`CREATE TABLE` + datos) |

---

## 6. Preguntas de repaso

1. ¿Por qué dos `SELECT` unidos con `UNION` deben tener el mismo número de columnas
   y qué pasa si no coinciden?
2. Explica con tus palabras por qué `UNION` es más lenta que `UNION ALL`.
3. Menciona dos situaciones donde `UNION ALL` sea **preferible** a `UNION`.
4. ¿Qué nombres reciben las columnas del resultado de un `UNION`? ¿De qué consulta
   dependen?
5. Escribe el equivalente de `INNER JOIN`, `LEFT JOIN` y `CROSS JOIN` usando
   operadores de conjuntos (`INTERSECT`, `EXCEPT`, `UNION ALL`) sobre
   `Staff` y `PropertyForRent`.
6. ¿Cuántas filas devuelve `Staff CROSS JOIN Branch`? ¿Y un `JOIN` sin `ON`?
7. ¿Cuál es la diferencia entre `ON` y `USING`? ¿Cuántas veces aparece la columna
   de la clave en el `SELECT`?
8. Escribe una consulta con `LEFT JOIN` que muestre **todos** los empleados y,
   en una columna, la dirección de su sucursal.
9. Explica por qué una condición sobre la tabla derecha en el `WHERE` "rompe" un
   `LEFT JOIN`.
10. ¿Cuándo conviene un `SELF JOIN`? Pon un ejemplo de jerarquía o de comparación.

---

## 7. Referencias

- Connolly & Begg — cap. 5 (*Relational Algebra*): operadores de conjuntos
  (`∪`, `∩`, `−`) y de joins (theta, phi-join, equi-join).
- Connolly & Begg — cap. 6 (*SQL: Data Manipulation*): `JOIN`, `UNION`,
  `INTERSECT`, `EXCEPT` y `DISTINCT`.
- Enlace a la Unidad 4: [Álgebra relacional](../unidad4-algebra-relacional/).
- Enlace a la Unidad 5: SQL (DDL y DML) — mismo `curso/docs/`.