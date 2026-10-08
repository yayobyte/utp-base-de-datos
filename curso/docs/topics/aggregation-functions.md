# Funciones de agregación

Una función de agregación toma **muchas filas** y devuelve **un solo valor**. Se usan en el `SELECT` (y en `HAVING`), casi siempre junto con `GROUP BY`.

## Las cinco funciones básicas

| Función | Qué hace | Tipos de dato | ¿Ignora `NULL`? |
|---|---|---|---|
| `COUNT(*)` | Cuenta **filas** (no tablas) | Cualquiera | No: cuenta todas las filas |
| `COUNT(col)` | Cuenta los valores no nulos de `col` | Cualquiera | Sí |
| `SUM(col)` | Suma los valores | Numéricos | Sí |
| `AVG(col)` | Promedio (`SUM / COUNT(col)`) | Numéricos | Sí |
| `MIN(col)` | Valor más pequeño | Numéricos, texto, fechas | Sí |
| `MAX(col)` | Valor más grande | Numéricos, texto, fechas | Sí |

## Ejemplos

Tabla de referencia `staff` (DreamHome):

```sql
-- ¿Cuántos empleados hay?
SELECT COUNT(*) AS total FROM staff;

-- ¿Cuántos empleados tienen sucursal asignada? (ignora NULL)
SELECT COUNT(branchno) FROM staff;

-- ¿Cuántas sucursales distintas tienen empleados?
SELECT COUNT(DISTINCT branchno) FROM staff;

-- Salario mínimo, máximo, promedio y nómina total
SELECT MIN(salary), MAX(salary), AVG(salary), SUM(salary)
FROM staff;
```

## Agrupar con `GROUP BY`

Sin `GROUP BY` toda la tabla es un solo grupo. Con `GROUP BY` se obtiene un valor **por grupo**:

```sql
-- Número de empleados y salario promedio por sucursal
SELECT branchno, COUNT(*) AS empleados, ROUND(AVG(salary), 2) AS promedio
FROM staff
GROUP BY branchno
ORDER BY branchno;
```

Regla: toda columna del `SELECT` que **no** esté dentro de una función de agregación debe aparecer en el `GROUP BY`.

## Filtrar grupos con `HAVING`

- `WHERE` filtra **filas** antes de agrupar (no puede usar agregaciones).
- `HAVING` filtra **grupos** después de agrupar.

```sql
-- Sucursales con más de un empleado que gane más de 10 000
SELECT branchno, COUNT(*) AS empleados
FROM staff
WHERE salary > 10000        -- filtra filas
GROUP BY branchno
HAVING COUNT(*) > 1;        -- filtra grupos
```

Orden lógico de ejecución: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY`.

## Errores frecuentes

- **Confundir `COUNT(*)` con `COUNT(col)`**: el segundo no cuenta los `NULL`.
- **`AVG` y los `NULL`**: un `NULL` no cuenta como 0; se excluye del promedio. Para tratarlo como 0: `AVG(COALESCE(col, 0))`.
- **Agregación en `WHERE`**: `WHERE AVG(salary) > 1000` es un error; va en `HAVING`.
- **Tabla vacía**: `COUNT` devuelve `0`; `SUM`, `AVG`, `MIN` y `MAX` devuelven `NULL`.
- **Columna sin agrupar**: `SELECT branchno, fname, COUNT(*) ... GROUP BY branchno` falla porque `fname` no está agrupada.
