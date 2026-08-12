# M2 — Autorizar el dominio nuevo en Firebase Authentication

**Objetivo:** permitir que el login con Google funcione desde `autogastopro.cc`.

**Tiempo estimado:** 2 minutos.
**Es obligatorio.** Sin este paso, al pulsar "Iniciar sesión con Google" en el dominio nuevo
la ventana emergente se abre y se cierra sola, y en la consola del navegador aparece el error
`auth/unauthorized-domain`. La app queda inutilizable.

---

## Por qué hace falta

La app usa `signInWithPopup` (`src/context/AuthContext.jsx:39`). Firebase mantiene una lista
blanca de dominios desde los que acepta iniciar sesión, y **rechaza cualquier otro**. Hoy esa
lista tiene `wally720.github.io` y `localhost`. Hay que añadir el dominio nuevo.

Esta lista **no está en el repositorio**: vive solo en la consola de Firebase. Por eso no puedo
tocarla yo.

---

## Pasos

### 1. Entra a la consola de Firebase

```
https://console.firebase.google.com
```

Inicia sesión con la cuenta de Google dueña del proyecto (la misma que usas para administrar
la app).

### 2. Abre el proyecto correcto

Verás tarjetas, una por proyecto. Entra en el proyecto de AutoGasto Pro.

> **¿Cuál es?** Es el que coincide con el valor de `VITE_FIREBASE_PROJECT_ID` en tu archivo
> `.env` local. Si tienes varios proyectos y dudas, abre el `.env` en tu editor y mira esa
> línea. Entrar en el proyecto equivocado y añadir el dominio ahí no rompe nada, pero tampoco
> arregla nada, y luego cuesta darse cuenta.

### 3. Ve a Authentication

En la barra lateral izquierda, bajo la sección **Compilación** (o *Build* si la tienes en
inglés), pulsa **Authentication**.

Se abre una pantalla con pestañas en la parte superior: *Users*, *Sign-in method*, *Templates*,
*Usage*, *Settings*.

### 4. Localiza la sección *Authorized domains*

⚠️ **Aquí hay dos posibilidades según la versión de consola que te toque. Las dos son
normales. Comprueba la primera y, si no está, ve a la segunda:**

**Opción A — pestaña `Settings`** (consola actual)
Pulsa **Settings** (*Configuración*), la última de la fila de pestañas. Dentro verás varias
secciones apiladas; busca **Authorized domains** (*Dominios autorizados*).

**Opción B — pestaña `Sign-in method`** (consolas más antiguas)
Pulsa **Sign-in method** (*Método de inicio de sesión*) y baja hasta el final de la página.
La sección **Authorized domains** está abajo del todo.

No importa por cuál de las dos llegues: es la misma lista y el resultado es idéntico.

### 5. Ábrela si está plegada

Algunas versiones muestran la sección colapsada. Pulsa sobre el título para desplegarla.

Contiene una tabla con los dominios permitidos. Ahora mismo deberías ver algo así:

```
localhost
<tu-proyecto>.firebaseapp.com
<tu-proyecto>.web.app
wally720.github.io
```

### 6. Añade el primer dominio

Pulsa **Add domain** (*Agregar dominio*). Se abre un cuadro de texto pequeño.

Escribe **exactamente** esto:

```
autogastopro.cc
```

> Reglas para no equivocarse:
> - **Sin** `https://` delante.
> - **Sin** barra `/` al final.
> - **Sin** espacios antes ni después.
> - Todo en minúsculas.

Pulsa **Add** (*Agregar*).

### 7. Añade el segundo dominio

Repite el paso 6, esta vez con:

```
www.autogastopro.cc
```

> **¿Por qué también el www, si va a redirigir al dominio pelado?** Porque la redirección la
> hace el servidor *después* de resolver el dominio, y si alguien llega con el www y el
> navegador ejecuta la app aunque sea un instante antes de redirigir, Firebase rechazaría el
> origen. Añadirlo cuesta 20 segundos y elimina toda una clase de fallo intermitente.

### 8. No borres nada todavía

Deja `wally720.github.io` en la lista. Mientras la migración no esté verificada del todo, es
tu red de seguridad para volver atrás. Te diré cuándo se puede quitar (y en realidad puede
quedarse ahí sin problema: no supone ningún riesgo).

---

## Cómo comprobar que quedó bien

En la tabla de **Authorized domains** deben verse ahora, como mínimo, estas entradas:

```
localhost
<tu-proyecto>.firebaseapp.com
<tu-proyecto>.web.app
wally720.github.io
autogastopro.cc
www.autogastopro.cc
```

No hay que guardar nada: Firebase aplica el cambio en el momento en que pulsas *Add*.
No hay botón de "Guardar" en esta pantalla.

Cuando termines, dime **"M2 hecho"** y una captura o la lista de dominios que ves. Yo la reviso
antes de que sigas con M3.

---

## Problemas frecuentes

**"Me dice que el dominio no es válido".**
Casi siempre es que pegaste `https://autogastopro.cc` o `autogastopro.cc/`. Borra el contenido
del cuadro y escríbelo a mano, solo el dominio.

**"No encuentro la sección Authorized domains".**
Revisa el paso 4: está en *Settings* o al final de *Sign-in method*, según tu versión de
consola. Si no aparece en ninguna de las dos, mándame una captura de la pantalla completa.

**"Añadí el dominio y el login sigue fallando".**
Mira el mensaje de error exacto en la consola del navegador (F12 → *Console*). Hay **tres**
listas blancas distintas y cada una da un error diferente:

| Mensaje | Causa | Documento |
|---|---|---|
| `auth/unauthorized-domain` | Esta lista, la de Firebase Auth | este (`M2`) |
| `auth/requests-from-referer-<dominio>-are-blocked` | Restricciones de la clave de API | `M9` |
| El login entra, pero no cargan los datos | App Check / reCAPTCHA | `M3` |

Si el error es el primero y ya añadiste el dominio, prueba en una ventana de incógnito: puede
ser caché del navegador.
