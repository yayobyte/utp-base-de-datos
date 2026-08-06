# Conceptos generales: dato, información y sistemas

- **Unidad / Tema:** Unidad 1 — Sistemas de Gestión de Bases de Datos. Conceptos generales: dato, información y sistemas.
- **Semanas relacionadas:** Semana 1 (3 - 7 de Ago.)
- **Referencias del libro guía:** Connolly & Begg (6.ª ed.), Cap. 1, 2, 3, 20. (Planeación, 4.ª ed. español: Cap. 1, 2, 3, 6.)
- **Referencias de clase:** Presentación *Conceptos generales: dato, información y conocimiento* (4/08/2026).
- **Enlaces relacionados:** [Unidad 1 — README](README.md) · [Libro guía](../libro-guia-connolly-begg.md)

---

## Contenido del tema

### Concepto de dato

- Elementos **discontinuos** que representan hechos.
- Representación simbólica de un atributo o variable cuantitativa o cualitativa. Puede ser: numérico, alfabético, algorítmico, espacial, entre otros.
- Los datos describen **hechos empíricos**, sucesos y entidades.
- De forma aislada pueden no contener información humanamente relevante.
- Los datos son la **materia prima de la información**.

**Ejemplos de datos:**

| Dato | Tipo |
| ---- | ---- |
| `casa` | alfabético |
| `alto` | alfabético |
| `175` | numérico |
| `rojo` | alfabético |
| `frío` | alfabético |

> Los datos convenientemente agrupados, estructurados e interpretados se consideran como la **base de la información**.

### Concepto de información

- **Conjunto organizado de datos procesados** que constituyen un mensaje que **cambia el estado de conocimiento** del sujeto o sistema que lo recibe.
- Permite tomar decisiones pertinentes acordes a dicho conocimiento.
- A diferencia de los datos o las percepciones sensibles, tiene una estructura útil que modifica las sucesivas interacciones con el entorno.

**La información se puede utilizar para:**

- La toma de decisiones.
- La reducción de la incertidumbre.
- La definición de hipótesis.
- La definición de teorías.
- La realización de cálculos.
- …

**Ejemplos de información (datos → información):**

| Datos | Información |
| ----- | ----------- |
| casa, rojo | La casa es roja |
| 175, Juan | La altura de Juan es 175 |
| frío | Hoy está haciendo frío |
| cielo, gris | El cielo está gris |
| pájaro, bajo | El pájaro vuela bajo |

> Procesamiento de datos → Información.

### Características / atributos de la información

| Característica | Descripción |
| -------------- | ----------- |
| **Significado (semántica)** | ¿Qué quiere decir? Del significado extraído, cada individuo evalúa las consecuencias posibles y adecúa sus actitudes y acciones. |
| **Importancia (relativa al receptor)** | ¿Trata sobre alguna cuestión importante? En qué grado cambia la actitud o conducta de los individuos. |
| **Vigencia (dimensión espacio-tiempo)** | ¿Es actual o desfasada? Sincronización temporal de los indicios con las expectativas en un momento dado. |
| **Validez (relativa al emisor)** | ¿El emisor es fiable o proporciona información no válida (falsa)? |
| **Valor (activo intangible volátil)** | ¿Cómo de útil resulta para el destinatario? |

### Concepto de conocimiento

- Hechos o información adquiridos a través de la **experiencia o la educación**; la **comprensión teórica o práctica** de un asunto referente a la realidad.
- Se adquiere como contenido intelectual relativo a un campo determinado o a la totalidad del universo.
- Representa toda certidumbre cognitiva mensurable según la respuesta a: **¿Por qué?**, **¿Cómo?**, **¿Cuándo?**, **¿Dónde?**

**Ejemplos de conocimiento (de información → conocimiento):**

| Información | Conocimiento |
| ----------- | ------------ |
| ¿Por qué hace frío en las mañanas? | Por las heladas de los meses de febrero y marzo. |
| ¿Por qué el cielo está gris? | Por la temporada de invierno. |
| ¿El búho vuela bajo? | Porque está cazando. |

### Concepto de sabiduría

- Habilidad que se desarrolla con la **aplicación de la inteligencia en la experiencia propia** (evaluación del conocimiento).
- Permite obtener conclusiones que dan mayor entendimiento, reflexionar, y **discriminación de la verdad, lo bueno y lo malo**.
- Ayuda a evitar o impedir peligros, alcanzar metas, aconsejar y resolver problemas.

> *«Tu mente es como esta agua amigo mío: cuando está agitada se vuelve difícil ver; pero si dejas que partes captitule la respuesta se vuelve clara»* — Maestro Oogway (Kung Fu Panda).

### Resumen de la jerarquía

| Nivel | Definición |
| ----- | ---------- |
| **Dato** | Elementos discontinuos que representan hechos. |
| **Información** | Datos procesados que son útiles. |
| **Conocimiento** | Comprensión teórica o práctica de la realidad. |
| **Sabiduría** | Evaluación del conocimiento. |

## Tipos de datos según su estructura (y metadatos)

Definición
: Son los referir a la **organización interna de los datos** y también al **formato** de los datos.

### Categorías de datos

| Categoría | Descripción |
| --------- | ----------- |
| **Estructurados** | Conformados por modelos de datos almacenados en forma tabular (filas y columnas), generalmente usan modelos relacionales y se almacenan en bases de datos relacionales (generados por ERP y CRM). Contenido típicamente textual. |
| **Semi-estructurados** | Tienen un nivel de estructura definida y consistente, pero que no puede relacionarse de forma natural. |
| **No estructurados** | No contienen un modelo de datos y generalmente son inconsistentes y no-relacionales; requieren personalización lógica especial para su preprocesamiento y almacenamiento. Aprox. **80 % de los datos de una organización** (imagen, texto, video, audio, documentos). |

**Semi-estructurados — ejemplos:**
- **JSON** (JavaScript Object Notation): formato de texto ligero para el intercambio de datos.
- **XML** (eXtensible Markup Language) · HTML.

**Fuentes de datos semi-estructurados:**
- EDI (Electronic Data Interchange).
- Emails.
- RSS (Really Simple Syndication).

**NoSQL** (*No Structured Query Language*) se usa para almacenar datos no estructurados, semi-estructurados y estructurados.

### Metadatos

- Suministran información acerca de la **estructura de los datos** o conjunto de datos.
- **«Datos que definen datos».**

**Ejemplos de metadatos.**
- Tags de XML suministran información del autor y fechas de creación de un documento.
- Atributos que suministran información del tamaño y resolución de una foto digital.

## Resumen del tema

1. **Dato** → materia prima; elemento discontinuo que representa un hecho.
2. **Información** → datos procesados y útiles que cambian el estado de conocimiento.
3. **Conocimiento** → comprensión teórica o práctica de la realidad.
4. **Sabiduría** → habilidad de evaluar el conocimiento, nacida de la inteligencia y la experiencia.
5. Las categorías de datos según su estructura son: **estructurados, semi-estructurados y no estructurados**.
6. **Metadatos** = datos que definen otros datos.

## Preguntas de repaso

1. ¿Cuál es la diferencia entre dato, información, conocimiento y sabiduría? Usa un ejemplo de cada uno.
2. ¿Por qué los datos aislados pueden no tener información relevante?
3. Enumera y describe las cinco características (atributos) de la información.
4. ¿Qué significa que la información tenga *vigencia* y *validez*?
5. ¿Cómo se transforman los datos en información y la información en conocimiento?
6. Clasifica los siguientes elementos en dato, información, conocimiento: `casa`, «la casa es roja», «porque las heladas de los meses de febrero y marzo», refleción ¿Por qué hace frío en las mañanas?
7. ¿Qué diferencia hay entre datos estructurados, semi-estructurados y no estructurados? Da un ejemplo de cada uno.
8. ¿Qué son los metadatos y por qué son útiles? Da un ejemplo de la vida real.
9. ¿Qué tipo de datos almacenan las bases de datos NoSQL?
10. ¿Por qué se dice que los datos no estructurados representan cerca del 80 % de los datos de una organización?

## Enlaces relacionados

- [Unidad 1 — README](README.md)
- [Libro guía Connolly & Begg](../libro-guia-connolly-begg.md)