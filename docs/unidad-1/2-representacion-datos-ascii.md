# Código ASCII: representación binaria de caracteres

- **Unidad / Tema:** Unidad 1 — Sistemas de Gestión de Bases de Datos. Fundamentos de representación de datos: código ASCII.
- **Semanas relacionadas:** Semana 1 (3 - 7 de Ago.)
- **Referencias del libro guía:** Connolly & Begg — Cap. 1 (representación de datos). Nociones base de computación (código binario).
- **Enlaces relacionados:** [Unidad 1 — README](README.md) · [Conceptos: dato, información y sistemas](conceptos-datos-informacion-sistemas.md)

---

## Contenido del tema

### Puntos a desarrollar

- ¿Qué es el código ASCII y para qué sirve?
- Relación del ASCII con el sistema binario.
- Tabla de caracteres: dígitos, letras y símbolos.
- ASCII de 7 y 8 bits; control vs imprimibles.
- ISO-8859-1, EBCDIC, Unicode/UTF-8.

## Mis notas

> [!note] Notas
> A nivel mundial se usan varios tipos de codificación.
>
> UTF-8 es el estándar actual; está presente en el 98 % de los sitios web al 2024.
>
> Con UTF-8 se pueden usar emojis y otros caracteres comunes.

> [!tip] Longitud variable de UTF-8 (de 1 a 4 bytes)
> - Caracteres ASCII (A, 1, $, …) → **1 byte**
> - Acentos y ñ, la mayoría de alfabetos latinos → **2 bytes**
> - Caracteres CJK (chino, japonés) → **3 bytes**
> - Emojis y símbolos raros → **4 bytes**
>
> Nota: el conjunto Unicode siempre asigna **un único número** a cada carácter; lo **variable** es cuántos bytes usa UTF-8 para guardarlo. Lo que ocupan más de 2 bytes se llaman **caracteres suplementarios**.

### Datos a saber sobre UTF-8

> [!tip] ¿Cómo sabe UTF-8 qué bytes forman cada carácter?
> Cada carácter marca en su **primer byte** cuántos bytes ocupa:
> - Empieza con `0` → 1 byte.
> - Empieza con `110` → 2 bytes.
> - Empieza con `1110` → 3 bytes.
> - Empieza con `11110` → 4 bytes.
> - Los **bytes siguientes** del mismo carácter siempre empiezan con **`10`** (bytes de continuación).
>
> Así, el lector recorre la cadena: al ver el byte inicial sabe cuántos "continuaciones" tomar, y al llegar a un byte que empieza con `0` inicia el siguiente carácter. Por eso UTF-8 es "auto-delimitado" (no se pierde el límite entre caracteres).

Ejemplo — carácter de 3 bytes seguido de uno de 1 byte:
```
1110 0011  10 010000  10 010111  01000001
└──3 bytes (ñ)──┘        └── A (1 byte)──┘
```
El primer byte `1110` avisa que vienen 2 bytes más de continuación; luego el byte `0` inicia un nuevo carácter.

- **UTF-8** (*Unicode Transformation Format - 8 bits*) es el estándar de codificación de caracteres más usado en la web.
- Es un esquema de **longitud variable**: usa de **1 a 4 bytes** por carácter.
- Es **compatible con ASCII**: los primeros 128 caracteres (0 – 127) se codifican igual que ASCII (1 byte). Por eso un texto en inglés/ASCII sirve igual en UTF-8.
- **Unicode** es el conjunto de caracteres (asigna un número a cada símbolo del mundo); **UTF-8** es la forma de representar/almacenar esos números.
- Soporta todos los idiomas del mundo, **tildes y ñ** (`á`, `é`, `ñ`), símbolos y **emojis**.
- Los emojis usan abreviaciones de 3 o 4 bytes.
- Es eficiente en inglés (menos bytes) y ligeramente más grande para acentos que Latin-1, pero es el estándar recomendado en bases de datos, HTML y almacenamiento de textos.

Ejemplo del byte ahorrado vs bytes:

```sql
-- 'A' en ASCII y UTF-8 = 1 byte (01000001)
-- 'ñ' en UTF-8 = 2 bytes
-- emoji 😀 en UTF-8 = 4 bytes
```

## Archivos

### Definición

Los archivos son **conjuntos de datos homogéneos** almacenados en un soporte externo, como un disco duro, un CD, etc.

### Clasificación por organización/almacenamiento

- **Archivos secuenciales:** como los almacenados en cinta magnética y otros.
- **Archivos aleatorios:** como los almacenados en unidades de disco o electrónicos.
- **Archivos indexados:** permiten acceder a las estructuras de datos en cualquier momento.

> [!success] Independencia de la información respecto a los datos

### Ventajas y desventajas

- **Secuenciales:** proveen una mayor utilización de espacio y además son más rápidos de leer.
- **Indexados:** permiten acceder en cualquier momento a las estructuras de datos, pero ocupan más espacio y son más lentos de leer.

# Serializacion 

Serializacion o marshalling transformacion un archivo en un formato mas manejable por ejemplo CSV, JSON, WSDL, XML.

### Formato CSV
Son archivos separados por comma y tienen un CR al final de cada linea

```csv
nombre,edad,sexo
Juan,25,Masculino
Maria,22,Femenino
```

### Formato XML
Son archivos que utilizan etiquetas para separar los datos

```xml
<elementos>
	<elemento>valor</elemento>
</elementos>
```

### JSON

Javascript object notation  su extension .json su sintaxis es la siguiente

```json
{
    "nombre": "Juan",
    "edad": 25,
    "sexo": "Masculino"
}
```

### BSON

JSON Binario, es principalmente usado para su almacenamiento y transferencia de datos en MongoDB.


## Enlaces relacionados

- [Unidad 1 — README](README.md)
- [Conceptos: dato, información y sistemas](conceptos-datos-informacion-sistemas.md)