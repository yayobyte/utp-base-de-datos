/* 1. Empleados con nombres y apellidos concatenados,
      género mostrado como Masculino/Femenino */
SELECT staffNo,
       fName || ' ' || lName AS nombreCompleto,
       CASE
         WHEN sex = 'M' THEN 'Masculino'
         WHEN sex = 'F' THEN 'Femenino'
         ELSE sex
       END AS genero,
       position, salary, branchNo
  FROM Staff
 ORDER BY staffNo;


/* 2. Empleados: código, nombre (MAYÚSCULA), apellido (minúscula),
      fecha en formato YYYY/DD/MM, salario mensual */
SELECT staffNo,
       UPPER(fName) AS nombre,
       LOWER(lName) AS apellido,
       TO_CHAR(DOB, 'YYYY/DD/MM') AS fecha_nacimiento,
       salary / 12 AS salario_mensual,
       position, branchNo
  FROM Staff
 ORDER BY staffNo;


/* 3. Propiedades con renta entre 370 y 600,
      incluir renta anual */
SELECT propertyNo, street, city, postcode, type, rooms,
       rent,
       rent * 12 AS renta_anual,
       ownerNo, staffNo, branchNo
  FROM PropertyForRent
 WHERE rent BETWEEN 370 AND 600
 ORDER BY rent;


/* 4. Código cliente, código propiedad visitada y comentarios
      de visitas antes del 15 de mayo */
SELECT v.clientNo, v.propertyNo, v.viewDate, v."comment"
  FROM Viewing v
 WHERE v.viewDate < '2004-05-15'
 ORDER BY v.viewDate;


/* 5. Nombres y apellidos de todas las personas,
      con campo indicando de qué tabla provienen */
(SELECT fName, lName, 'Empleado' AS tabla_origen FROM Staff)
UNION ALL
(SELECT fName, lName, 'Cliente' AS tabla_origen FROM Client)
UNION ALL
(SELECT fName, lName, 'Propietario' AS tabla_origen FROM PrivateOwner)
 ORDER BY fName, lName;


/* 6. Nombres (fname) comunes entre empleados y clientes */
SELECT DISTINCT s.fName
  FROM Staff s
 WHERE s.fName IN (SELECT c.fName FROM Client c)
 ORDER BY s.fName;


/* 7. Códigos de empleados que NO tienen propiedad asignada */
SELECT staffNo, fName, lName, position, branchNo
  FROM Staff
 WHERE staffNo NOT IN (SELECT DISTINCT staffNo FROM PropertyForRent WHERE staffNo IS NOT NULL)
 ORDER BY staffNo;


/* 8. Información de propiedades sin empleado asignado */
SELECT propertyNo, street, city, postcode, type, rooms, rent,
       ownerNo, staffNo, branchNo
  FROM PropertyForRent
 WHERE staffNo IS NULL
 ORDER BY propertyNo;


/* 9. Información de empleados + street y postcode de su sucursal
      (sin usar JOIN - usando subconsultas) */
SELECT staffNo, fName, lName, position, sex, DOB, salary,
       (SELECT street FROM Branch b WHERE b.branchNo = Staff.branchNo) AS branch_street,
       (SELECT postcode FROM Branch b WHERE b.branchNo = Staff.branchNo) AS branch_postcode,
       branchNo
  FROM Staff
 ORDER BY staffNo;
