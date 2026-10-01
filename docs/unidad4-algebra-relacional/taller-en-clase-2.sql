/* 1. Mostrar la información de todos los clientes */
SELECT *
  FROM Client;

/* 2. Nombre, apellido, fecha de nacimiento y edad a la fecha (años) */
SELECT fName, lName, DOB,
       EXTRACT(YEAR FROM AGE(CURRENT_DATE, DOB)) AS edad
  FROM Staff;

/* 3. Nombre y apellido en minúsculas */
SELECT LOWER(fName) AS nombre, LOWER(lName) AS apellido
  FROM Staff;

/* 4. Nombre y apellido con las iniciales en mayúsculas */
SELECT INITCAP(fName) AS nombre, INITCAP(lName) AS apellido
  FROM Staff;

/* 5. Clientes que solo están interesados en apartamentos (Flat) */
SELECT *
  FROM Client
 WHERE prefType = 'Flat';

/* 6. Clientes que pueden pagar más de 420 al mes */
SELECT *
  FROM Client
 WHERE maxRent > 420;

/* 7. Todos los empleados + columna con lo que se paga en el año */
SELECT staffNo, fName, lName, position, salary,
       salary * 12 AS salarioAnual
  FROM Staff;

/* 8. Propietarios con los nombres de los campos en español */
SELECT ownerNo AS "Número Propietario",
       fName   AS "Nombre",
       lName   AS "Apellido",
       address AS "Dirección",
       telNo   AS "Teléfono"
  FROM PrivateOwner;

/* 9. Clientes con nombre y apellido en un solo campo (concatenación) */
SELECT clientNo,
       fName || ' ' || lName AS nombreCompleto,   -- también: CONCAT(fName, ' ', lName)
       telNo, prefType, maxRent
  FROM Client;

/* 10. Operaciones de conjuntos: UNIÓN, DIFERENCIA, INTERSECCIÓN */

/* 10.1 UNIÓN: ciudades donde hay una sucursal o un inmueble */
(SELECT city FROM Branch          WHERE city IS NOT NULL)
UNION
(SELECT city FROM PropertyForRent WHERE city IS NOT NULL);

/* 10.2 UNIÓN ALL: igual que la anterior pero conservando duplicados */
(SELECT city FROM Branch)
UNION ALL
(SELECT city FROM PropertyForRent);

/* 10.3 INTERSECCIÓN: ciudades donde hay sucursal Y también inmuebles */
(SELECT city FROM Branch)
INTERSECT
(SELECT city FROM PropertyForRent);

/* 10.4 DIFERENCIA: ciudades con sucursal pero SIN inmuebles */
(SELECT city FROM Branch)
EXCEPT
(SELECT city FROM PropertyForRent);

/* 10.5 DIFERENCIA inversa: ciudades con inmuebles pero SIN sucursal */
(SELECT city FROM PropertyForRent)
EXCEPT
(SELECT city FROM Branch);

/* 10.6 UNIÓN: todas las personas del sistema (empleados, clientes y propietarios) */
SELECT fName, lName, 'Empleado'    AS tipo FROM Staff
UNION
SELECT fName, lName, 'Cliente'     AS tipo FROM Client
UNION
SELECT fName, lName, 'Propietario' AS tipo FROM PrivateOwner;

/* 10.7 INTERSECCIÓN: clientes que han visitado un inmueble Y además lo arrendaron */
SELECT clientNo, propertyNo FROM Viewing
INTERSECT
SELECT clientNo, propertyNo FROM Lease;

/* 10.8 DIFERENCIA: clientes registrados que NO han visitado ningún inmueble */
SELECT clientNo FROM Client
EXCEPT
SELECT clientNo FROM Viewing;
