Especificación Técnica: Sistema de Registro de Notas UTP para Generación de Código

1. Contexto y Objetivos del Proyecto

El propósito de esta especificación es definir la base de conocimiento estructural y lógica para el sistema de "Registro de Notas UTP". Este documento está diseñado para actuar como el núcleo de verdad técnica que permitirá al agente de IA en Antigravity generar de forma automatizada tanto el frontend (React/TypeScript) como la lógica de backend (NestJS).

El objetivo primordial es garantizar que la arquitectura sea escalable, modular y cumpla con las restricciones de integridad académica institucional. Siguiendo los estándares de ingeniería de datos, se establece un modelo que separa la capa de dominio de la implementación, permitiendo una generación de código limpia y blindada ante inconsistencias.

2. Arquitectura del Modelo Entidad-Relación Extendido (E-ER)

Basado en los principios de modelado de Connolly & Begg (Capítulos 12 y 13), se define la entidad Estudiante como una superclase con especialización total y disjunta.

2.1 Definición de Superclase y Subclases

* Superclase: Estudiante (Contiene atributos comunes a toda la población).
* Jerarquía de Subclases:
  1. Normal: Rendimiento estándar satisfactorio.
  2. Prueba: Sujeto a seguimiento condicional por bajo rendimiento.
  3. Transición: En proceso de cambio de plan o reingreso.
  4. Fuera: Retiro oficial o pérdida de cupo.

2.2 Mapeo de Atributos y Herencia

De acuerdo con la lógica de herencia de atributos (Cap. 13), todas las subclases heredan los atributos de la superclase. La siguiente tabla identifica los atributos base y los atributos específicos introducidos por cada subclase.

Atributo	Superclase: Estudiante	Subclase: Normal	Subclase: Prueba	Subclase: Transición	Subclase: Fuera
estudianteId (PK)	Base	Inherited	Inherited	Inherited	Inherited
nombreCompleto	Base	Inherited	Inherited	Inherited	Inherited
programaId (FK)	Base	Inherited	Inherited	Inherited	Inherited
fechaIngreso	Base	Inherited	Inherited	Inherited	Inherited
promedioSemestral		X			
periodosEnPrueba			X		
planAnteriorId				X	
motivoRetiro					X

2.3 Restricciones de Especialización

* Participación Total: Cada instancia de la superclase debe pertenecer obligatoriamente a una subclase.
* Restricción Disjunta: Un estudiante pertenece exclusivamente a una subclase en un momento dado; los estados son mutuamente excluyentes (e.g., no puede ser Normal y Fuera simultáneamente).

3. Lógica de Atributos Derivados (Campos Virtuales)

Los siguientes campos deben implementarse como lógica de negocio calculada en el backend (NestJS) y consumida mediante Custom Hooks en el frontend:

1. /promedioIntegral: Cálculo matemático del promedio ponderado histórico.
  * Fórmula: \sum (NotaFinal_i \times Créditos_i) / \sum Créditos_i.
  * Rango: [0.0 - 5.0].
2. /créditosAcumulados: Sumatoria total de créditos de asignaturas cuyo valor en la entidad Nota sea \ge 3.0.
3. /estado (Matriz de Transición):
  * Si /promedioIntegral < 3.0 Y /créditosAcumulados < 20 por periodo \rightarrow El sistema debe forzar el cambio a subclase Prueba.
  * Si periodosEnPrueba > 2 \rightarrow El sistema debe forzar el cambio a subclase Fuera.

4. Diccionario de Datos y Restricciones de Integridad

4.1 Entidad: Estudiante (Superclase)

Atributo	Tipo de Dato	Rango / Dominio	Restricción
estudianteId	Integer	> 0	PK
nombreCompleto	String	Alfanumérico (Max 150)	Not Null
programaId	Integer	FK (Programa)	Not Null
/promedioIntegral	Decimal(3,2)	0.00 - 5.00	Virtual / Calculated

4.2 Entidad: Asignatura

Atributo	Tipo de Dato	Rango / Dominio	Restricción
asignaturaId	String	Código Alfanumérico	PK
nombre	String	Alfanumérico	Not Null
créditos	SmallInt	1 - 6	Check Range

4.3 Entidad: Nota

Atributo	Tipo de Dato	Rango / Dominio	Restricción
notaId	Integer	> 0	PK
valor	Decimal(3,2)	0.00 - 5.00	Check Range
estudianteId	Integer	FK (Estudiante)	Not Null
asignaturaId	String	FK (Asignatura)	Not Null
periodoId	String	FK (Calendario)	Not Null

4.4 Entidad: CalendarioAcadémico

Atributo	Tipo de Dato	Rango / Dominio	Restricción
periodoId	String	Formato AAAA-P	PK
fechaInicio	Date	Fecha ISO	Not Null
fechaFin	Date	> fechaInicio	Not Null

5. Reglas de Negocio Críticas

* Control de Temporalidad: El motor de persistencia debe validar el periodoId actual contra la fecha del sistema. No se permiten inserciones en Nota si la fecha actual está fuera del rango definido en CalendarioAcadémico.
* Validación de Prerrequisitos: Antes de permitir una inscripción, el sistema debe ejecutar una verificación recursiva en el árbol de dependencias de la Asignatura. Si existe un prerrequisito con nota < 3.0, la transacción de matrícula debe abortarse.
* Priorización de Cupos: Los turnos de inscripción se generan mediante un ordenamiento descendente basado primariamente en /créditosAcumulados y secundariamente en /promedioIntegral.
* Consistencia de Especialización: Cualquier actualización que afecte los umbrales de /estado debe desencadenar un cambio automático de subclase bajo una transacción atómica.

6. Requerimientos de Interfaz y Flujos de Usuario

6.1 Módulo Docente

* Ingreso Masivo con Optimistic UI: Interfaz basada en una rejilla (grid) de alto rendimiento (Tailwind/Chakra-UI). Al ingresar una nota, el frontend debe actualizar el estado local inmediatamente mientras la persistencia en el backend ocurre en segundo plano para evitar bloqueos.
* Validación Local: El componente de entrada debe rechazar mediante máscaras de texto cualquier valor fuera del rango 0.0-5.0 antes de llegar al servicio.

6.2 Módulo Estudiante

* Pre-matrícula Inteligente: Vista de selección de asignaturas que oculta dinámicamente materias cuyos prerrequisitos no han sido satisfechos.
* Dashboard de Progreso: Visualización del /promedioIntegral mediante componentes de Chakra-UI (Progress Bars/Stats) con datos derivados en tiempo real.

7. Guía de Implementación para el Agente de Generación

Para asegurar la calidad de producción, el agente de generación debe seguir estos patrones arquitectónicos:

* Stack Tecnológico:
  * Frontend: React con TypeScript y Chakra-UI para los componentes de sistema de diseño.
  * Backend: NestJS para la lógica de dominio y servicios.
  * Testing: Implementar Unit Testing exhaustivo con Jest y React Testing Library para validar los cálculos de atributos derivados.
* Arquitectura de Software:
  * Clean Architecture: Separación clara entre controladores, servicios (lógica de negocio) y repositorios (data access).
  * Custom Hooks: Encapsular la lógica de /promedioIntegral y /estado en hooks reutilizables para el frontend.
  * Seguridad: Validar tipos y rangos tanto en el DTO (Data Transfer Object) de NestJS como en los esquemas de validación de formularios en React.

Toda la generación de código debe priorizar la modularidad y el tipado fuerte, garantizando que las restricciones definidas en el diccionario de datos se reflejen en los tipos de TypeScript de extremo a extremo.
