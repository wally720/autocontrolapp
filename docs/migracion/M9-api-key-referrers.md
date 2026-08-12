# M9 — Autorizar el dominio en las restricciones de la clave de API

**Objetivo:** que el login con Google deje de bloquearse por el origen de la petición.

**Tiempo estimado:** 3 minutos.
**Es obligatorio** si aparece el error de abajo.

**Síntoma exacto:**

```
FirebaseError: Firebase: Error
(auth/requests-from-referer-https://autogastopro.cc-are-blocked.)
```

---

## Por qué existe este documento

Durante la migración se documentaron tres listas blancas de dominios. **En realidad hay
cuatro.** Esta es la que faltaba, y se descubrió al ejecutar el checklist final.

| # | Sistema | Consola | Documento |
|---|---|---|---|
| 1 | Firebase Authentication — *Authorized domains* | Firebase | `M2` |
| 2 | reCAPTCHA Enterprise — *Domains* | Google Cloud | `M3` |
| 3 | **Clave de API — restricciones de sitio web** | Google Cloud | **este** |

Son tres sistemas independientes, con tres pantallas distintas, y hay que hacer los tres.

## Cómo distinguir este fallo de `M2`

Los dos rompen el login, pero el mensaje de error es distinto. Es la forma rápida de saber
cuál te toca:

| Mensaje de error | Causa | Documento |
|---|---|---|
| `auth/unauthorized-domain` | Falta el dominio en Firebase Authentication | `M2` |
| `auth/requests-from-referer-<dominio>-are-blocked` | Falta el dominio en la clave de API | **este** |

Si ves el segundo, **`M2` está bien hecho**. No lo repitas ni lo toques.

## Qué es esto en realidad

La clave `VITE_FIREBASE_API_KEY` de tu `.env` no es un secreto — viaja dentro del JavaScript
público de la app y cualquiera puede leerla. Lo que impide que un tercero la use en su propia
web es precisamente esta restricción: la clave solo acepta peticiones que **provengan de una
lista concreta de dominios**.

Al cambiar de dominio, el nuevo no estaba en esa lista, así que Google rechazó la petición. La
protección funcionó exactamente como debía.

---

## Pasos

### 1. Entra a las credenciales de Google Cloud

```
https://console.cloud.google.com/apis/credentials
```

Inicia sesión con la **misma cuenta de Google** que usaste en `M2` y `M3`.

Si prefieres navegar a mano: menú lateral ☰ → **APIs y servicios** → **Credenciales**.

### 2. Selecciona el proyecto correcto

En la barra superior, el selector de proyecto. Elige el mismo proyecto de AutoGasto Pro que
usaste en `M3`. Si ya aparece el nombre correcto, no toques nada.

### 3. Localiza la clave

Baja hasta la sección **Claves de API** (*API Keys*). Verás una tabla.

Busca la fila llamada:

```
Browser key (auto created by Firebase)
```

> Ese es el nombre que Firebase le pone automáticamente. Si alguien la renombró, o hay varias,
> compárala con el valor de `VITE_FIREBASE_API_KEY` de tu `.env`: la columna de la clave
> muestra los primeros caracteres, y hay un icono para revelarla entera.
>
> **Si hay varias claves y ninguna coincide, para y avísame** antes de tocar nada.

Pulsa sobre el **nombre** de la clave para abrirla.

### 4. Ve a las restricciones de aplicación

Se abre la pantalla de detalle. Busca el bloque **Restricciones de aplicación**
(*Application restrictions*). Debería tener seleccionada la opción **Sitios web**
(*Websites*).

Debajo hay una lista de **Referencias del sitio web** (*Website restrictions*). Ahora mismo
contendrá algo como:

```
wally720.github.io/*
localhost/*
```

> ⚠️ **Si en su lugar está marcada la opción `Ninguna` (*None*)**, entonces la clave no tiene
> restricciones y este no puede ser tu problema. Sal **sin guardar** y avísame: el error
> vendría de otro sitio y habría que mirarlo de nuevo.

### 5. Añade las dos entradas nuevas

Pulsa **AGREGAR UN ELEMENTO** (*ADD AN ITEM*) y escribe, exactamente:

```
autogastopro.cc/*
```

Pulsa **LISTO** (*DONE*), vuelve a pulsar **AGREGAR UN ELEMENTO** y añade la segunda:

```
*.autogastopro.cc/*
```

Pulsa **LISTO** otra vez.

> **Hacen falta las dos, y no es redundancia.** Google documenta que el comodín `*` sustituye a
> **un subdominio o a una ruta**, pero no puede ir en medio de una URL. Consecuencia práctica:
> `autogastopro.cc/*` cubre el dominio pelado y todas sus páginas, pero **no** cubre `www`. La
> segunda entrada, `*.autogastopro.cc/*`, es la que cubre `www` y cualquier otro subdominio.
>
> El `/*` del final es imprescindible en ambas: sin él solo se autorizaría la portada exacta,
> no el resto de la app.

### 6. No borres las entradas que ya estaban

Deja `wally720.github.io/*` y `localhost/*`.

- `localhost/*` lo necesitas para seguir desarrollando en tu máquina.
- `wally720.github.io/*` es la red de seguridad para poder volver atrás.

### 7. Guarda

Pulsa **GUARDAR** (*SAVE*) al final de la página.

> ⏱️ **El cambio puede tardar unos minutos en aplicarse.** Google no documenta un plazo
> concreto. Si pruebas de inmediato y sigue fallando, espera 5 minutos y vuelve a probar en una
> ventana de incógnito antes de dar el paso por malo.

---

## Cómo comprobar que quedó bien

1. Abre una **ventana de incógnito** en `https://autogastopro.cc`.
2. Pulsa iniciar sesión con Google.
3. La ventana emergente debe abrirse y dejarte entrar.

Si entra, continúa con el checklist `M7` desde el paso 12 (los datos), que es lo que valida
`M3`.

---

## Problemas frecuentes

**"Sigue saliendo el mismo error de referer".**
Comprueba en este orden:
1. ¿Pasaron 5 minutos y probaste en incógnito?
2. ¿Escribiste el `/*` al final de las dos entradas?
3. ¿Guardaste? Es fácil añadir los elementos y salir sin pulsar **GUARDAR**.

**"Ahora sale `auth/unauthorized-domain`".**
Es otro fallo distinto, y significa que este ya está resuelto. Ve a `M2`.

**"Entra al login pero el dashboard sale vacío o da error de permisos".**
Eso es `M3` (App Check / reCAPTCHA), no esto. El login funcionando y los datos fallando es
justo el síntoma que describe `M3`.

**"No tengo permisos para editar la clave".**
Tu cuenta necesita el rol *Editor* o *Propietario* sobre el proyecto. Si lo creaste tú, ya lo
tienes. Si sale un error de permisos, avísame.
