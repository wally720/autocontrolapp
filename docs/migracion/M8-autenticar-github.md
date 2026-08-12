# M8 — Autenticar Git con GitHub (macOS)

**Objetivo:** que `npm run deploy` pueda subir a GitHub sin pedirte usuario y contraseña.

**Tiempo estimado:** 5 minutos. Se hace **una sola vez**; después queda guardado para siempre.

**Cuándo:** cuando `npm run deploy` falle con este error:

```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/wally720/autocontrolapp.git/'
```

---

## Qué ha pasado (y qué NO ha pasado)

**GitHub dejó de aceptar contraseñas para operaciones de Git en agosto de 2021.** Aunque
escribas tu contraseña correcta, la rechaza. Hay que usar otro tipo de credencial.

**Esto no tiene nada que ver con la migración de dominio.** Es la configuración de Git de tu
ordenador. Te habría pasado igual con cualquier otro despliegue.

**Tu trabajo no se ha perdido.** El build terminó bien: la carpeta `dist/` ya está compilada y
correcta, con el `CNAME` dentro. Solo falta el último paso, subirla. Cuando termines este
documento, repites `npm run deploy` y continúa desde donde se quedó.

---

## Paso 0 — Averigua qué camino te toca

Hay dos formas de resolverlo. Ejecuta esto en la terminal para saber cuál te conviene:

```bash
gh --version
```

- **Si responde con un número de versión** (por ejemplo `gh version 2.x.x`) → ve a la
  **Opción A**. Es la más rápida.
- **Si responde `command not found`** → ve a la **Opción B**. No necesitas instalar nada.

---

## Opción A — Con GitHub CLI (`gh`), si ya lo tienes

### A1. Inicia sesión

```bash
gh auth login
```

Te hará una serie de preguntas. Responde así, moviéndote con las flechas y confirmando con
Enter:

| Pregunta | Respuesta |
|---|---|
| *What account do you want to log into?* | `GitHub.com` |
| *What is your preferred protocol for Git operations?* | `HTTPS` |
| *Authenticate Git with your GitHub credentials?* | `Yes` |
| *How would you like to authenticate?* | `Login with a web browser` |

### A2. Completa en el navegador

La terminal te muestra un **código de un solo uso** del estilo `ABCD-1234`. Cópialo.

Pulsa Enter y se abrirá el navegador en la página de activación de GitHub. Pega el código y
autoriza.

> La pregunta *"Authenticate Git with your GitHub credentials?"* es la importante: es la que
> hace que `git` y `npm run deploy` puedan subir sin pedirte nada. Si respondes `No`, el
> problema no se arregla.

### A3. Comprueba

```bash
gh auth status
```

Debe decir `Logged in to github.com as wally720`.

**Ya está.** Salta al apartado *"Vuelve a desplegar"* del final.

---

## Opción B — Con un token personal, sin instalar nada

Vas a crear un **token**: una contraseña especial, solo para Git, que puedes revocar cuando
quieras sin tocar tu cuenta.

### B1. Abre la página de tokens

```
https://github.com/settings/tokens
```

Si prefieres navegar a mano: foto de perfil → **Settings** → abajo del todo en la barra
lateral, **Developer settings** → **Personal access tokens** → **Tokens (classic)**.

### B2. Crea el token

Pulsa **Generate new token** y elige **Generate new token (classic)**.

> Si el menú te ofrece *Fine-grained tokens*, puedes usarlos, pero el clásico es más simple
> para esto. Usa el clásico.

### B3. Rellena el formulario

| Campo | Qué poner |
|---|---|
| **Note** | `deploy autocontrolapp` (es solo una etiqueta para reconocerlo) |
| **Expiration** | `90 days` está bien. Si eliges `No expiration` no caduca nunca, pero es menos seguro |
| **Select scopes** | Marca **únicamente** la casilla **`repo`** |

> ⚠️ **Marca solo `repo`.** Al marcarla se seleccionan solas sus sub-casillas: es correcto y
> esperado. No marques nada más: `repo` es todo lo que necesita el despliegue.

### B4. Genera y copia

Baja del todo y pulsa **Generate token**.

Aparece el token en un recuadro verde: una cadena larga que empieza por `ghp_`.

> 🔴 **Se muestra UNA SOLA VEZ.** Si cierras la página sin copiarlo, tendrás que crear otro.

Pulsa el icono de copiar.

> 🔒 **No me lo pegues en el chat.** A diferencia del token de Cloudflare, este no lo necesito
> yo: lo usas tú directamente en tu terminal. Un token con permiso `repo` puede modificar todos
> tus repositorios, así que no debe salir de tu ordenador.

### B5. Úsalo al desplegar

Vuelve a la terminal y ejecuta:

```bash
npm run deploy
```

Cuando te pregunte:

```
Username for 'https://github.com':
```
Escribe: **`wally720`** y pulsa Enter.

```
Password for 'https://wally720@github.com':
```
**Pega el token** (no tu contraseña) y pulsa Enter.

> **El cursor no se moverá y no verás nada al pegar.** Es normal: la terminal oculta las
> contraseñas por seguridad. Pega y pulsa Enter aunque parezca que no ha pasado nada.

### B6. Que no te lo vuelva a pedir

En macOS, Git suele guardar la credencial en el Llavero automáticamente tras el primer uso
correcto. Para asegurarte, ejecuta:

```bash
git config --global credential.helper osxkeychain
```

Si el token te lo volvió a pedir en un despliegue posterior, ejecuta ese comando y repite B5
una vez más. A partir de ahí queda guardado.

---

## Vuelve a desplegar

Con cualquiera de las dos opciones ya resuelta:

```bash
npm run deploy
```

Debe terminar con:

```
Published
```

Y después, el chequeo que de verdad importa:

```bash
git fetch origin gh-pages
git show origin/gh-pages:CNAME
```

Debe imprimir `autogastopro.cc`.

Con eso, `M6` queda completado y se continúa con `M4`.

---

## Problemas frecuentes

**"Sigue diciendo Invalid username or token".**
Casi siempre es que se pegó la contraseña de GitHub en vez del token, o que el token se copió
incompleto. Los tokens clásicos empiezan por `ghp_`. Créalo de nuevo desde B2.

**"Dice: Permission denied" o "403".**
El token existe pero le falta el permiso `repo`. Vuelve a B3 y créalo marcando esa casilla.

**"No me pide nada y falla igual".**
Hay una credencial vieja e incorrecta guardada en el Llavero. Ejecuta:

```bash
git credential-osxkeychain erase
host=github.com
protocol=https
```

Escribe esas tres líneas, deja **una línea en blanco** al final y pulsa Enter. Luego repite B5.

**"Me da miedo tener un token dando vueltas".**
Puedes revocarlo cuando quieras en <https://github.com/settings/tokens>, con el botón
**Delete**. Si lo haces, el siguiente despliegue volverá a pedirte credenciales y tendrás que
crear otro. Por eso conviene ponerle caducidad en lugar de borrarlo a mano.
