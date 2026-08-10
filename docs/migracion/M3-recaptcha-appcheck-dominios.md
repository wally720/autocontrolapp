# M3 — Autorizar el dominio en la clave de reCAPTCHA Enterprise (App Check)

**Objetivo:** que Firestore siga entregando los datos cuando la app corre en `autogastopro.cc`.

**Tiempo estimado:** 3 minutos.
**Es obligatorio.** Y es el paso que más se pasa por alto en este tipo de migraciones.

---

## Por qué hace falta, y por qué NO basta con M2

Son dos listas blancas distintas, en dos consolas distintas, y hay que hacer las dos:

| | M2 (ya hecho) | M3 (este documento) |
|---|---|---|
| Sistema | Firebase **Authentication** | **App Check** / reCAPTCHA Enterprise |
| Consola | console.firebase.google.com | console.cloud.google.com |
| Qué protege | El inicio de sesión | Las llamadas a Firestore |
| Si falta | El login ni siquiera abre | El login **funciona**, pero la app se queda sin datos |

El síntoma cuando falta M3 es especialmente confuso: **entras perfectamente con tu cuenta de
Google, y luego el dashboard aparece vacío o con un error de permisos.** Parece un bug de la
app o de las reglas de Firestore. No lo es: es App Check rechazando el token porque el dominio
no está en la lista de la clave de reCAPTCHA.

La app inicializa App Check con reCAPTCHA Enterprise en `src/config/firebase.js:29-32`, usando
la clave de `VITE_FIREBASE_RECAPTCHA_KEY`. Esa clave tiene su propia lista de dominios
permitidos, que se administra en Google Cloud.

---

## Antes de empezar: localiza tu clave

Abre tu archivo `.env` local (en la raíz del proyecto) y busca esta línea:

```
VITE_FIREBASE_RECAPTCHA_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Ese valor que empieza por `6L` es el **ID de la clave**. Anótalo o déjalo a mano: lo vas a
necesitar en el paso 3 para no confundirte de clave si hay varias.

---

## Pasos

### 1. Entra a la consola de Google Cloud

```
https://console.cloud.google.com/security/recaptcha
```

Inicia sesión con la **misma cuenta de Google** que usaste en M2.

> ⚠️ **Google renombró esta sección.** Antes se llamaba *Security → reCAPTCHA Enterprise* y
> ahora aparece como **Google Cloud Fraud Defense**, con reCAPTCHA dentro. El enlace de arriba
> te redirige solo al sitio correcto.
>
> Si te pierdes, usa el buscador de la barra superior de la consola: escribe `reCAPTCHA` y
> pulsa el resultado que lleve a la lista de claves. Llegarás a la misma pantalla.

### 2. Selecciona el proyecto correcto

En la barra superior, a la izquierda, hay un selector de proyecto (un desplegable con el
nombre del proyecto actual). Pulsa ahí y elige el proyecto de AutoGasto Pro.

> Es el **mismo** proyecto que en Firebase: cada proyecto de Firebase es también un proyecto de
> Google Cloud, con el mismo nombre e ID. Si el selector ya muestra el nombre correcto, no
> toques nada.

### 3. Localiza la clave

Verás una tabla titulada **reCAPTCHA** con una fila por clave. Las columnas incluyen
*Display name*, *ID de clave* (o *Key ID*), *Tipo* y *Plataforma*.

Busca la fila cuyo **ID de clave** coincida con el valor que anotaste del `.env`.

> Si solo hay una clave de tipo *Website* / *Sitio web*, es esa.
> Si hay varias y ninguna coincide con tu `.env`, **para y avísame** antes de tocar nada:
> significa que la app está usando una clave que no está donde esperamos.

Pulsa sobre el **nombre** de la clave para abrirla.

### 4. Entra en modo edición

Se abre la página de detalle de la clave. Arriba hay un botón **EDITAR CLAVE** (o *EDIT KEY*).
Púlsalo.

### 5. Abre la sección de dominios

En el formulario de edición busca la sección **Dominios** (*Domains*). Contiene una lista de
los dominios desde los que la clave acepta peticiones. Deberías ver algo como:

```
wally720.github.io
localhost
```

> ⚠️ **Si esta sección está vacía o no aparece**, busca justo encima un interruptor llamado
> exactamente **Inhabilitar la verificación de dominios** (*Disable domain verification*).
> Si está activado, la clave acepta peticiones desde cualquier dominio y **no tienes que hacer
> nada más en M3**: sal sin guardar y dime *"la verificación de dominios está desactivada"*.
> Funciona igual tras la migración, aunque es menos seguro. **No lo actives tú si está
> apagado** — es justamente la protección que queremos conservar.

### 6. Añade el dominio

Pulsa **AGREGAR DOMINIO** (*ADD DOMAIN*). Aparece un campo de texto vacío.

Escribe exactamente:

```
autogastopro.cc
```

> Reglas idénticas a M2: **sin** `https://`, **sin** barra final, **sin** espacios, en
> minúsculas.

**Y ya está. Este es el único dominio que hay que añadir aquí.**

> **Por qué aquí NO hace falta poner el `www`, aunque en M2 sí:** reCAPTCHA incluye los
> subdominios automáticamente. La documentación de Google lo dice explícitamente: si indicas
> `ejemplo.com`, no necesitas indicar `sub.ejemplo.com`. Firebase Authentication (M2) **no**
> funciona así y exige cada dominio por separado. Son dos sistemas con reglas distintas; por
> eso los pasos no son simétricos.
>
> Añadir `www.autogastopro.cc` aquí no rompería nada, simplemente sobra.

### 7. No borres los dominios existentes

Deja `wally720.github.io` y `localhost` en la lista.

- `localhost` lo necesitas para seguir desarrollando en tu máquina.
- `wally720.github.io` es la red de seguridad para poder volver atrás.

### 8. Guarda

Pulsa **GUARDAR** (*SAVE*) abajo del formulario.

> El cambio no siempre es instantáneo: la propagación puede tardar **unos minutos**. Si pruebas
> la app inmediatamente después y falla, espera 5 minutos y vuelve a probar en una ventana de
> incógnito antes de dar por malo el paso.

---

## Cómo comprobar que quedó bien

Vuelve a abrir la clave (pasos 3-4) y confirma que en **Dominios** aparecen estas tres
entradas:

```
localhost
wally720.github.io
autogastopro.cc
```

(Si ya había otros dominios antes, seguirán ahí; es correcto. Lo que importa es que
`autogastopro.cc` esté en la lista.)

Cuando termines, dime **"M3 hecho"** y la lista de dominios que ves.

---

## Problemas frecuentes

**"La página /security/recaptcha me pide habilitar una API".**
Aparece un botón *HABILITAR* para la API de reCAPTCHA Enterprise. Eso significa que estás en el
proyecto equivocado (en el correcto ya está habilitada, porque la app la está usando). Revisa
el selector de proyecto del paso 2. **No habilites la API en un proyecto que no sea el tuyo.**

**"No tengo permisos para editar la clave".**
Tu cuenta necesita el rol *reCAPTCHA Enterprise Admin* o *Editor* sobre el proyecto. Si el
proyecto lo creaste tú con tu propia cuenta, ya lo tienes. Si te sale un error de permisos,
avísame.

**"Guardé y la app sigue sin cargar datos en el dominio nuevo".**
Comprueba en este orden:
1. ¿Pasaron 5 minutos? La propagación no es inmediata.
2. Abre la consola del navegador (F12 → pestaña *Console*) en `https://autogastopro.cc` y
   búscame el mensaje de error exacto. Si menciona `appCheck` o `403`, es esto. Si menciona
   `permission-denied` de Firestore sin mencionar App Check, es otra cosa (reglas de Firestore)
   y lo miramos aparte.
