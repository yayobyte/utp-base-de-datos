/* 1. Listar códigos cliente, nombre, apellido, código propiedad,
      fecha visita y comentarios - ordenados cronológicamente */
SELECT c.clientNo, c.fName, c.lName, v.propertyNo, v.viewDate, v."comment"
  FROM Client c
  JOIN Viewing v ON c.clientNo = v.clientNo
 ORDER BY v.viewDate ASC;


/* 2. ¿Cuáles son las propiedades recomendadas a cada cliente
      basado en el máximo que pueden pagar? */
SELECT c.clientNo, c.fName, c.lName, c.maxRent,
       p.propertyNo, p.street, p.city, p.rent, p.type
  FROM Client c
  JOIN PropertyForRent p ON c.maxRent >= p.rent
 ORDER BY c.clientNo, p.rent;


/* 3. Mostrar apellidos, nombres y códigos de identificación
      de todas las personas en la base de datos */
(SELECT staffNo AS codigo, lName AS apellido, fName AS nombre, 'Empleado' AS tipo
   FROM Staff)
UNION ALL
(SELECT clientNo AS codigo, lName AS apellido, fName AS nombre, 'Cliente' AS tipo
   FROM Client)
UNION ALL
(SELECT ownerNo AS codigo, lName AS apellido, fName AS nombre, 'Propietario' AS tipo
   FROM PrivateOwner);


/* 4. Mostrar nombre del cliente que NO colocó comentarios,
      además mostrar código de la propiedad */
SELECT DISTINCT c.clientNo, c.fName, c.lName, v.propertyNo
  FROM Client c
  JOIN Viewing v ON c.clientNo = v.clientNo
 WHERE v."comment" IS NULL;


/* 5. Mostrar información de todos los empleados junto a la propiedad
      que le fue asignada para rentar */
SELECT s.staffNo, s.fName, s.lName, s.position, s.salary, s.branchNo,
       p.propertyNo, p.street, p.city, p.type, p.rent
  FROM Staff s
  LEFT JOIN PropertyForRent p ON s.staffNo = p.staffNo
 ORDER BY s.staffNo;


/* 6. Listar todos los detalles del personal que trabaja
      en la sucursal de Glasgow */
SELECT s.staffNo, s.fName, s.lName, s.position, s.sex, s.DOB, s.salary, s.branchNo,
       b.street, b.city, b.postcode
  FROM Staff s
  JOIN Branch b ON s.branchNo = b.branchNo
 WHERE b.city = 'Glasgow'
 ORDER BY s.staffNo;


/* 7. Listar propiedades ubicadas en Glasgow o London */
SELECT propertyNo, street, city, postcode, type, rooms, rent, ownerNo, staffNo, branchNo
  FROM PropertyForRent
 WHERE city IN ('Glasgow', 'London')
 ORDER BY city, street;


/* 8. Mostrar sucursal (dirección, ciudad), nombres del personal asociado,
      direcciones y ciudades de propiedades para rentar */
SELECT b.branchNo, b.street AS branchStreet, b.city AS branchCity, b.postcode,
       s.staffNo, s.fName, s.lName, s.position,
       p.propertyNo, p.street AS propertyStreet, p.city AS propertyCity, p.type, p.rent
  FROM Branch b
  LEFT JOIN Staff s ON b.branchNo = s.branchNo
  LEFT JOIN PropertyForRent p ON s.staffNo = p.staffNo
 ORDER BY b.branchNo, s.staffNo, p.propertyNo;
