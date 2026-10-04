# Libro Guía: *Database Systems — A Practical Approach to Design, Implementation, and Management* (Connolly & Begg)

- **Unidad / Tema:** Referencia general del texto guía para todas las unidades.
- **Semanas relacionadas:** Todas (semanas 1 a 16).
- **Referencias del libro guía:** Connolly, T. M. & Begg, C. E. *Database Systems: A Practical Approach to Design, Implementation, and Management* (6.ª ed., Pearson — Addison Wesley, 2015, edición global en inglés).
- **Enlaces relacionados:** [README de unidades](README.md) · [syllabus](../../syllabus.md)

---

> ⚠️ **Aviso importante sobre la numeración de capítulos.**
> La planeación de la asignatura (`syllabus.md` y la PDF «IS644 Planeación») cita
> números de capítulo correspondientes a la **4.ª edición en español**
> (*Sistemas de bases de datos*, Pearson – Addison Wesley, 2005), no a la 6.ª edición
> en inglés que se encuentra en esta carpeta. Las tablas de esta página usan la
> **numeración de la 6.ª edición** (la del PDF disponible) y, cuando se conoce,
> se indica la equivalencia con la edición citada en la planeación.

---

## 1. Identificación del texto

| Campo | Valor |
| :--- | :--- |
| Título | Database Systems: A Practical Approach to Design, Implementation, and Management |
| Autores | Thomas M. Connolly y Carolyn E. Begg |
| Edición | 6.ª edición, edición global (inglés) |
| Editorial | Pearson — Addison Wesley (2015) |
| Estructura | 9 partes · 34 capítulos · apéndices A–O (algunos en línea) |
| Caso de estudio central | **DreamHome** (inmobiliaria de ejemplo usada en todo el libro) |
| Edición citada en la asignatura | 4.ª ed. en español, *Sistemas de bases de datos* (2005) |

---

## 2. Estructura del libro por partes

| Parte | Título | Capítulos (6.ª ed.) | Contenido general |
| :---: | :--- | :---: | :--- |
| 1 | Background | 1 – 3 | Introducción a BD, entorno de BD (arquitectura ANSI-SPARC), arquitecturas y Web |
| 2 | The Relational Model and Languages | 4 – 9 | Modelo relacional, álgebra y cálculo relacional, SQL (DML, DDL, avanzado), ORDBMS |
| 3 | Database Analysis and Design | 10 – 15 | Ciclo de vida, análisis de requisitos (DreamHome), modelos E/R y E/R-E, normalización |
| 4 | Methodology | 16 – 19 | Metodología de diseño: conceptual, lógico, físico, monitoreo y ajuste |
| 5 | Selected Database Issues | 20 – 23 | Seguridad y administración, aspectos legales, gestión de transacciones, procesamiento de consultas |
| 6 | Distributed DBMSs and Replication | 24 – 26 | BD distribuidas (conceptos y avanzado), réplica y BD móviles |
| 7 | Object DBMSs | 27 – 28 | OODBMS: conceptos y diseño; estándares y sistemas (ODMG, ObjectStore) |
| 8 | The Web and DBMSs | 29 – 30 | Tecnología Web + SGBD, datos semiestructurados y XML |
| 9 | Business Intelligence | 31 – 34 | Data Warehousing (conceptos y diseño), OLAP, Data Mining |

---

## 3. Detalle por capítulo (6.ª edición)

### Parte 1 — Background
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 1 | Introduction to Databases | Sistemas basados en archivos, enfoque de BD, componentes del entorno SGBD, roles, historia, ventajas/desventajas |
| 2 | Database Environment | Arquitectura de tres niveles ANSI-SPARC, independencia de datos, DDL/DML, modelos de datos, funciones del SGBD |
| 3 | Database Architectures and the Web | Arquitecturas multiusuario (cliente-servidor 2 y 3 capas, n-capas), servicios web, SOA, BD distribuidas, data warehousing, cloud, arquitectura Oracle |

### Parte 2 — The Relational Model and Languages
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 4 | The Relational Model | Estructura relacional, propiedades de las relaciones, claves, restricciones de integridad (entidad, referencial, generales), vistas |
| 5 | Relational Algebra and Relational Calculus | Álgebra relacional (unarias, conjuntos, joins, división, agregación), cálculo relacional de tuplas y de dominios |
| 6 | SQL: Data Manipulation | Consultas simples, ORDER BY, agregación, GROUP BY, subconsultas, ANY/ALL, joins, EXISTS, UNION/INTERSECT/EXCEPT, actualizaciones |
| 7 | SQL: Data Definition | Tipos de datos, integridad (DDL), CREATE/ALTER/DROP TABLE/INDEX, vistas, transacciones, GRANT/REVOKE |
| 8 | Advanced SQL | PL/SQL (declaraciones, control, excepciones, cursores), subprogramas, procedimientos/funciones/paquetes, triggers, recursión |
| 9 | Object-Relational DBMSs | Aplicaciones avanzadas, debilidades del RDBMS, SQL:2011 (tipos definidos por el usuario, subtipos, colecciones), extensiones OO de Oracle |

### Parte 3 — Database Analysis and Design
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 10 | Database System Development Lifecycle | Ciclo de vida del sistema de BD: planeación, definición, recolección de requisitos, diseño, selección SGBD, implementación, pruebas, mantenimiento |
| 11 | Database Analysis and the DreamHome Case Study | Técnicas de recolección de hechos (documentación, entrevistas, observación, investigación, cuestionarios), caso DreamHome |
| 12 | Entity–Relationship Modeling | Entidades, relaciones, atributos, claves, entidades fuertes/débiles, restricciones estructurales, multiplicidad, trampas de abanico/abismo |
| 13 | Enhanced Entity–Relationship Modeling | Especialización/generalización, superclases/subclases, herencia de atributos, restricciones, agregación, composición |
| 14 | Normalization | Propósito, redundancia y anomalías, dependencias funcionales, 1FN, 2FN, 3FN |
| 15 | Advanced Normalization | Reglas de inferencia, conjuntos mínimos, BCNF, 4FN (dependencias multivaluadas), 5FN (join sin pérdida) |

### Parte 4 — Methodology
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 16 | Methodology — Conceptual Database Design | Pasos 1: construir modelo de datos conceptual (entidades, relaciones, atributos) |
| 17 | Methodology — Logical Database Design | Paso 2: modelo lógico para el modelo relacional (mapeo ER→relacional, validación por normalización) |
| 18 | Methodology — Physical Database Design | Pasos 3–6: traducir modelo lógico, organizaciones de archivos e índices, vistas de usuario, mecanismos de seguridad |
| 19 | Methodology — Monitoring and Tuning | Pasos 7–8: desnormalización y redundancia controlada, monitoreo y ajuste del sistema operativo |

### Parte 5 — Selected Database Issues
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 20 | Security and Administration | Amenazas, contramedidas (autorización, control de accesos, vistas, copias, integridad, cifrado, RAID), seguridad web, administración de datos y de BD |
| 21 | Professional, Legal, and Ethical Issues | Ética y legalidad en TI, legislación (Sarbanes-Oxley, HIPAA), propiedad intelectual |
| 22 | Transaction Management | Propiedades ACID, control de concurrencia (bloqueos, deadlock, marcas de tiempo, optimistas), recuperación de BD, modelos avanzados |
| 23 | Query Processing | Descomposición de consultas, optimización heurística y por costos, estadísticas, planes de ejecución |

### Parte 6 — Distributed DBMSs and Replication
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 24 | Distributed DBMSs — Concepts and Design | Conceptos, ventajas/desventajas, arquitecturas, fragmentación y asignación de datos, transparencias, reglas de Date |
| 25 | Distributed DBMSs — Advanced Concepts | Transacciones distribuidas, concurrencia, deadlock, recuperación, commit de 2 fases (2PC/3PC), modelo X/Open |
| 26 | Replication and Mobile Databases | Modelos de réplica, esquemas (primary copy, update anywhere), BD móviles, réplica en Oracle |

### Parte 7 — Object DBMSs
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 27 | Object-Oriented DBMSs — Concepts and Design | OODBMS, persistencia, transacciones/versiones, esquema evolutivo, ventajas/desventajas, diseño y UML |
| 28 | Object-Oriented DBMSs — Standards and Systems | OMG/CORBA, estándar ODMG 3.0, ObjectStore |

### Parte 8 — The Web and DBMSs
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 29 | Web Technology and DBMSs | Internet/Web, HTML/HTTP/URL, integración Web–SGBD, CGI, Java/JDBC, ASP/JSP, plataforma Oracle |
| 30 | Semistructured Data and XML | Datos semiestructurados, XML, DTD, XSLT, XPath, XML Schema, XQuery, JSON, XML y BD |

### Parte 9 — Business Intelligence
| Cap. | Título | Temas clave |
| :---: | :--- | :--- |
| 31 | Data Warehousing Concepts | Conceptos, arquitectura del almacén de datos, ETL, data marts, OLTP vs DW, metadatos |
| 32 | Data Warehousing Design | Metodologías, ciclo de vida de Kimball, modelado dimensional (esquema estrella/copo de nieve) |
| 33 | OLAP | Modelo multidimensional, operaciones OLAP (slice, dice, pivot), herramientas, categorías de servidores OLAP |
| 34 | Data Mining | Técnicas (modelado predictivo, segmentación, análisis de enlaces, detección de desviaciones), proceso CRISP-DM, herramientas |

---

## 4. Apéndices

| Apéndice | Título | Disponibilidad |
| :---: | :--- | :--- |
| A | Users’ Requirements Specification for DreamHome | Impreso |
| B | Other Case Studies (University Accommodation Office, EasyDrive, Wellmeadows Hospital) | Impreso |
| C | Alternative ER Modeling Notations (Chen, Crow’s Feet, etc.) | Impreso |
| D | Summary of the Database Design Methodology | Impreso |
| E | Introduction to Pyrrho: A Lightweight RDBMS | Impreso |
| F | File Organizations and Indexes | En línea |
| G – O | (When Is a DBMS Relational?; Access y Oracle; SQL programático; estimación de espacio; conceptos OO; scripts web; QBE; manifiestos de 3.ª generación; Postgres) | En línea |

---

## 5. Mapa del libro → unidades de la asignatura

Referencias de la planeación (numeración 4.ª ed. español) y capítulos equivalentes de la 6.ª edición:

| Unidad | Tema | Caps. citados en el plan | Caps. 6.ª ed. sugeridos |
| :---: | :--- | :---: | :---: |
| 1 | Sistemas de Gestión de Bases de Datos | 1, 2, 3, 6 | 1, 2, 3, 20 |
| 2 | Modelo de Datos | 1, 2 | 2, 4 |
| 3 | Introducción al Diseño de BD | 9, 10, 11, 12 | 10, 11, 12, 13, Ap. C |
| 4 | Fundamentos del Modelo Relacional | 4, 13, 14, 15, 16, 17 | 4, 5, 14, 15, 16, 17, 18 |
| 5 | SQL | 5, 6, 7, Ap. F | 6, 7, 8 |
| 6 | Integridad y Seguridad | 9, 15, 16, 17, 19 | 4, 7, 20, 22 |
| 7 | Otras Orientaciones | 31, 32, 33, 34 | 24, 27, 28, 31, 32, 33, 34 |

---

## 6. Preguntas de repaso

1. ¿Qué diferencia hay entre la arquitectura ANSI-SPARC de tres niveles y los niveles conceptual, lógico y físico de diseño?
2. ¿Qué es la independencia de datos y por qué es un objetivo fundamental de los SGBD?
3. ¿Cuáles son los componentes del entorno de una base de datos (cap. 1) y las funciones de un SGBD (cap. 2)?
4. ¿En qué parte del libro se explican el ciclo de vida de desarrollo y las metodologías de diseño? ¿Cuáles son los 8 pasos de la metodología?
5. ¿Qué capítulos cubren normalización y dependencias funcionales? ¿Y cuáles cubren SQL?
6. ¿Dónde se explican las restricciones de integridad (entidad y referencial)? ¿Y la gestión de transacciones y concurrencia?
7. ¿Qué caso de estudio se usa de forma transversal en el libro? ¿Dónde se encuentra su especificación completa?
