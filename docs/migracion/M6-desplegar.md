# M6 — Desplegar la app al dominio nuevo

**Objetivo:** publicar la versión con el dominio nuevo en GitHub Pages.

**Tiempo estimado:** 5 minutos.
**Es obligatorio.** Y lo tienes que hacer tú, desde tu ordenador.

**Cuándo hacerlo:** después de M2 y M3, y después de que yo te confirme *"DNS configurado"*.
Antes de M4.

---

## Por qué no puedo hacerlo yo

El despliegue compila la app metiendo dentro las claves de Firebase, que viven en tu archivo
`.env` local. Ese archivo **no está en el repositorio** (está excluido en `.gitignore:71-75`) y
yo no tengo sus valores.

Además, no hay ningún panel de hosting ni GitHub Actions donde esas claves estén guardadas: el
proyecto se despliega a mano y las variables se inyectan en el momento de compilar, desde tu
máquina. Por eso este paso es tuyo por diseño.

> Si en el futuro quieres que el despliegue sea automático en cada push, se puede montar con
> GitHub Actions guardando las claves como *secrets* del repositorio. Es un trabajo aparte;
> dímelo cuando quieras y lo planificamos.

---

## Cómo abrir una terminal (si no lo tienes claro)

Una "terminal" es una ventana donde se escriben órdenes en texto en lugar de hacer clic.

- **Windows:** pulsa la tecla de Windows, escribe `powershell` y pulsa Enter.
- **Mac:** pulsa `Cmd + Espacio`, escribe `terminal` y pulsa Enter.
- **Linux:** pulsa `Ctrl + Alt + T`.

Se abre una ventana con texto y un cursor parpadeando. **Cada bloque gris de este documento es
una orden**: cópiala, pégala en esa ventana y pulsa Enter. Escríbelas de una en una, esperando
a que cada una termine antes de pasar a la siguiente.

> Para pegar en la terminal: en Windows y Linux suele ser `Ctrl + Shift + V`; en Mac, `Cmd + V`.
> Si `Ctrl + V` no funciona, prueba con el botón derecho del ratón.

### Sobre `~/ruta/a/autocontrolapp`

En las órdenes de abajo verás `~/ruta/a/autocontrolapp`. **Eso no es literal**: tienes que
sustituirlo por la carpeta real donde tienes el proyecto en tu ordenador.

Truco para no equivocarte: escribe `cd ` (con un espacio detrás) y **arrastra la carpeta del
proyecto** desde el explorador de archivos hasta la ventana de la terminal. La ruta se escribe
sola. Luego pulsa Enter.

---

## Antes de empezar: comprueba que tienes lo necesario

En la terminal, sitúate en la carpeta del proyecto y ejecuta:

```bash
cd ~/ruta/a/autocontrolapp   # sustituye por la ruta real de tu copia
ls -a | grep env
```

Debes ver un archivo llamado **`.env`** (además de `.env.example`).

**Si NO aparece `.env`:** para aquí y avísame. Sin él, la app compila pero se queda sin
conexión a Firebase, y el sitio publicado quedaría roto. No sigas.

**Si aparece**, comprueba qué claves tiene. Este comando imprime **solo los nombres, nunca los
valores**, así que puedes pegar el resultado en el chat sin exponer nada:

```bash
grep -oE '^VITE_FIREBASE[A-Z_]*' .env | sort
```

Deben salir estas **8**, que son las imprescindibles para desplegar:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_APP_ID
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_RECAPTCHA_KEY
VITE_FIREBASE_STORAGE_BUCKET
```

Puede salir además una novena, `VITE_FIREBASE_APPCHECK_DEBUG_TOKEN`. **Es opcional y solo
sirve para desarrollo local**: `src/config/firebase.js:21` la ignora fuera de modo desarrollo,
así que no influye en el despliegue. Que esté o que falte da igual para este paso.

**Si falta alguna de las 8 de la lista, para y avísame** diciéndome cuál (el nombre, no el
valor). Sin ella la app compila igual pero se queda sin conexión a Firebase, y el sitio
publicado quedaría roto.

---

## Pasos

### 1. Sitúate en la carpeta del proyecto

```bash
cd ~/ruta/a/autocontrolapp
```

### 2. Trae la última versión del código

```bash
git checkout main
git pull origin main
```

> Esto descarga los cambios de la migración. Si `git pull` te da un error de conflicto,
> **para y avísame**; no intentes resolverlo por tu cuenta.

### 3. Confirma que tienes los cambios correctos

```bash
grep base vite.config.js
cat public/CNAME
```

Debe salir exactamente:

```
  base: '/',
autogastopro.cc
```

> **Si `base` todavía dice `/autocontrolapp/`, o si `public/CNAME` no existe, PARA.** No
> despliegues. Significa que el código de la migración no llegó a tu copia, y desplegar así
> dejaría el sitio en un estado intermedio. Avísame.

### 4. Instala las dependencias

```bash
npm ci
```

Tarda un par de minutos la primera vez. Es normal que imprima muchas líneas.

### 5. Despliega

```bash
npm run deploy
```

Esto hace dos cosas seguidas: compila la app (`npm run build`) y sube el resultado a la rama
`gh-pages` del repositorio.

Al terminar debe aparecer una línea que dice:

```
Published
```

**Esa palabra es la señal de éxito.** Si en su lugar ves un error en rojo, cópiamelo entero
y pégamelo en el chat. No lo intentes otra vez sin decírmelo.

---

## Cómo comprobar que quedó bien

Ejecuta:

```bash
git fetch origin gh-pages
git show origin/gh-pages:CNAME
```

Debe imprimir:

```
autogastopro.cc
```

> **Este es el chequeo más importante de todo el despliegue.** Si el archivo `CNAME` no está en
> la rama `gh-pages`, GitHub perderá el dominio y el sitio se caerá. Si no imprime eso,
> avísame antes de tocar nada más.

Después, dime **"M6 hecho"** y yo verifico el resto desde fuera.

---

## Muy importante para el futuro

Cada vez que vuelvas a ejecutar `npm run deploy`, el comando **borra y reescribe entera** la
rama `gh-pages`. El dominio sobrevive únicamente porque el archivo `CNAME` está dentro del
código, en `public/CNAME`, y se recompila en cada build.

**Nunca borres `public/CNAME`.** Si desaparece, el siguiente despliegue tumba el dominio y el
sitio deja de responder en `autogastopro.cc` hasta que se vuelva a configurar a mano.

---

## Problemas frecuentes

**`npm: command not found`**
No tienes Node.js instalado o no está en el PATH de esa terminal. Descárgalo de
<https://nodejs.org> (versión LTS) y vuelve a abrir la terminal.

**`fatal: not a git repository`**
No estás dentro de la carpeta del proyecto. Revisa el `cd` del paso 1.

**El comando pide usuario y contraseña de GitHub**
Tu Git no tiene credenciales guardadas. Avísame y lo resolvemos; no escribas tu contraseña de
GitHub ahí, porque GitHub ya no la acepta para esto.

**Terminó con `Published` pero el sitio viejo sigue igual**
Normal durante unos minutos: GitHub tarda en publicar. Espera 5 minutos y recarga con
`Ctrl+Shift+R` (o `Cmd+Shift+R` en Mac) para saltarte la caché del navegador.
