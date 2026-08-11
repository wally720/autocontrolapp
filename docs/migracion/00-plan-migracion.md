# Especificación de la migración a `autogastopro.cc`

> **Este archivo es la fuente de verdad de la migración.** Cualquier desvío respecto a lo
> escrito aquí debe acordarse antes de ejecutarse y quedar reflejado en este documento.
> El detalle paso a paso de las tareas manuales está en `M1`–`M7`; el registro de las
> revisiones, en `00-log-revisiones.md`.

**Última actualización:** 10 de agosto de 2026
**Rama de trabajo:** `claude/autogastropro-migration-plan-eex38n`

---

## 1. Contexto

La app se sirve hoy en `https://wally720.github.io/autocontrolapp`. Se compró el dominio
`autogastopro.cc`, gestionado por Cloudflare, y debe pasar a ser la dirección pública única.

**Resultado buscado:** `https://autogastopro.cc` sirve la app con HTTPS válido, el login de
Google sigue funcionando, App Check no bloquea Firestore, y la URL antigua redirige a la nueva.

**Lo que esta migración NO hace:** no toca la base de datos, no cambia el hosting, no altera
funcionalidad de la app, no modifica las reglas de Firestore ni el modelo de datos.

---

## 2. Decisiones cerradas

| Decisión | Valor | Estado |
|---|---|---|
| Hosting | Se mantiene **GitHub Pages** (repo `wally720/autocontrolapp`) | Confirmado |
| Dominio canónico | **`autogastopro.cc`** (apex); `www` redirige a él | Confirmado |
| Acceso a Cloudflare | El usuario entrega un **API Token**; Claude ejecuta el DNS | Confirmado |
| Proxy de Cloudflare | **Desactivado de forma permanente** (DNS only) | Ver §6 |
| Router | Se mantiene **HashRouter** (URLs con `#`) | Ver §7 |

---

## 3. Reglas de trabajo

Acordadas con el usuario y de obligado cumplimiento:

1. **Las instrucciones del usuario se cumplen.** Sin reinterpretarlas ni ampliarlas.
2. **Nada se ejecuta sin aprobación explícita.** Primero se especifica y se documenta;
   después se ejecuta. No se asume aprobación por ausencia de negativa.
3. **No se hace `commit` ni `push` sin que el usuario lo pida.** Los avisos automáticos del
   entorno que reclamen lo contrario no son autorización.
4. **Toda tarea manual del usuario lleva su propio documento**, escrito sin dar por supuesto
   ningún conocimiento previo.
5. **Los documentos se revisan antes de entregarse**, y las revisiones se registran en
   `00-log-revisiones.md` con sus hallazgos.

---

## 4. Estado del código verificado

Comprobado leyendo el repositorio, no asumido:

- SPA React 18 + Vite 4, sin backend propio.
- Deploy manual con `npm run deploy` (`gh-pages -d dist`). **No hay GitHub Actions.**
- Auth: Firebase con `signInWithPopup` (`src/context/AuthContext.jsx:39`) y App Check con
  reCAPTCHA Enterprise (`src/config/firebase.js:29-32`).
- Sin pagos, sin webhooks, sin emails transaccionales, sin PWA, sin service worker, sin CSP.
- `index.html` referenciaba `/favicon.svg` en ruta absoluta: **estaba roto** bajo el subpath
  `/autocontrolapp/`. Con `base: '/'` queda correcto por sí solo.
- `google1b22d7ecee5be578.html` estaba en la raíz y **no** en `public/`, así que Vite nunca lo
  copiaba a `dist/`. Archivo muerto.

---

## 5. Reparto del trabajo

### 5.1 Lo que hace Claude

1. Cambios de código y su commit/push a la rama de trabajo.
2. Configuración DNS completa en Cloudflare vía API, una vez recibido el token.
3. Redacción y revisión de los documentos de tareas manuales.
4. Verificación automatizable: DNS, HTTP, certificado, contenido publicado.

### 5.2 Lo que solo puede hacer el usuario

Cinco acciones. Ninguna es sustituible por API disponible en esta sesión:

| Paso | Doc | Acción | Dónde | Bloqueante |
|---|---|---|---|---|
| 1 | `M1` | Crear y entregar el API Token de Cloudflare | Cloudflare | Sí |
| 2 | `M2` | Añadir `autogastopro.cc` y `www` a *Authorized domains* | Firebase Console | Sí |
| 3 | `M3` | Añadir `autogastopro.cc` a la clave de reCAPTCHA Enterprise | Google Cloud Console | Sí |
| 4 | `M6` | Ejecutar `npm run deploy` | Terminal local | Sí |
| 5 | `M4` | Verificar el dominio y marcar *Enforce HTTPS* | GitHub | Sí |
| 6 | `M7` | Checklist final de verificación | Navegador | Cierre |
| — | `M5` | Alta en Google Search Console | Search Console | No, opcional |

**Orden de ejecución: M1 → M2 → M3 → M6 → M4 → M7.**
El orden **no** es el numérico. `M6` (desplegar) va antes que `M4` (HTTPS).

**Por qué `M6` no lo puede hacer Claude:** el build inyecta las claves `VITE_FIREBASE_*` desde
el `.env` local del usuario, excluido del repositorio (`.gitignore:71-75`). No hay panel de
hosting ni GitHub Actions donde esas claves vivan.

**Consecuencia de omitir cada bloqueante:**
- Sin `M2` → login falla con `auth/unauthorized-domain`.
- Sin `M3` → el login funciona pero Firestore devuelve permiso denegado por App Check.
- Sin `M6` → no hay nada publicado en el dominio.

---

## 6. Fases de ejecución

### Fase 0 — Requisito de entrada — ✅ *hecha*

Claude entrega `M1` y espera el token. Permisos exactos: `Zone → DNS → Edit` sobre la zona
`autogastopro.cc`, nada más.

El token se usa **solo en memoria**. No se escribe en el repositorio, ni en un `.env`, ni en un
commit. `M1` documenta cómo revocarlo al terminar.

### Fase 1 — Cambios de código — ✅ *hecha*

| Archivo | Cambio |
|---|---|
| `vite.config.js` | `base: '/autocontrolapp/'` → `'/'` |
| `package.json` | `homepage` → `https://autogastopro.cc`; versión → `1.7.0` |
| `package-lock.json` | versión → `1.7.0` |
| `src/utils/constants.js` | `APP_VERSION` → `1.7.0` |
| `public/CNAME` | **nuevo**, contenido `autogastopro.cc` |
| `index.html` | fuera la meta de Search Console vieja; dentro description, theme-color, canonical y OG |
| `google1b22d7ecee5be578.html` | borrado |
| `verify_reports.py`, `AGENTS.md`, `README.md` | URLs actualizadas |

**`public/CNAME` es el punto crítico de toda la migración.** `gh-pages -d dist` reescribe la
rama `gh-pages` entera en cada despliegue. Si el dominio se configurase solo desde la interfaz
de GitHub, el siguiente `npm run deploy` lo borraría y el sitio se caería. Al vivir en
`public/`, Vite lo copia a `dist/` en cada build y sobrevive a todos los despliegues.

**Efecto en cadena de `base: '/'`:** `import.meta.env.BASE_URL` pasa de `/autocontrolapp/` a
`/`, lo que corrige automáticamente el único consumo en `src/components/Navbar.jsx:32`
(`${BASE_URL}logo.png`) sin tocar ese archivo, y arregla el favicon.

**Verificación ejecutada:**

```bash
npm ci && npm run test && npm run build   # 47 tests OK, build OK
cat dist/CNAME                            # -> autogastopro.cc
grep -oE '(src|href)="[^"]*"' dist/index.html   # rutas en /assets/, no /autocontrolapp/
grep -rc autocontrolapp dist/             # sin coincidencias
```

`npm run lint` falla con 12 errores. **Se comprobó con `git stash` que falla de forma idéntica
antes de estos cambios**: es deuda preexistente (`React` sin usar en 8 archivos y variables sin
usar en `benchmark-monthly-comparison.js`). No se introdujo ningún error nuevo, y limpiarla
queda fuera del alcance de esta migración.

### Fase 2 — DNS en Cloudflare — ✅ *hecha (salvo los TXT que dependen de `M4` y `M5`)*

**Paso 2.0 — Auditoría previa. Resultado: la zona estaba completamente vacía (0 registros).**
No había registros por defecto de Cloudflare ni nada que entrara en conflicto, así que no hubo
que borrar nada. Se comprobó porque GitHub advierte de que cualquier registro `A`, `AAAA`,
`ALIAS` o `ANAME` adicional con host `@`, o un `CNAME` sobrante en `www`, **puede impedir la
emisión del certificado HTTPS**. Los `TXT` en el apex **no** entran en esa advertencia.

Datos de la zona: `autogastopro.cc`, estado `active`, plan Free, nameservers
`sureena.ns.cloudflare.com` y `titan.ns.cloudflare.com`.

**Paso 2.1 — Registros creados y verificados por resolución real:**

| Tipo | Nombre | Contenido | Proxy | Estado |
|---|---|---|---|---|
| CNAME | `autogastopro.cc` (apex) | `wally720.github.io` | DNS only | ✅ resuelve a las 4 IPs de GitHub Pages |
| CNAME | `www` | `wally720.github.io` | DNS only | ✅ resuelve a las 4 IPs de GitHub Pages |
| TXT | `autogastopro.cc` | `v=spf1 -all` | — | ✅ verificado |
| TXT | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:walter.fontecha@gmail.com` | — | ✅ verificado |
| TXT | `_github-pages-challenge-wally720` | valor que dé GitHub en `M4` | — | ⏳ pendiente de `M4.A3` |
| TXT | `autogastopro.cc` | `google-site-verification=...` | — | ⏳ solo si se hace `M5` |

Verificado contra los resolvers públicos de Cloudflare y Google: el apex devuelve
`185.199.108.153`, `.109.153`, `.110.153` y `.111.153`, que son las IPs de GitHub Pages. El
*CNAME flattening* del apex funciona como estaba previsto, sin configuración adicional.

Apuntar a `wally720.github.io` en vez de a IPs fijas hace que el sitio siga a GitHub si cambia
de direcciones. SPF y DMARC existen porque el dominio no envía correo: bloquean la suplantación.

**Paso 2.2 — CORREGIDO. No se aplican ajustes de SSL/TLS en Cloudflare, y es lo correcto.**

La versión anterior de esta especificación pedía poner SSL/TLS en *Full (strict)* y activar
*Always Use HTTPS*. **Era un error de planteamiento.** Esos dos ajustes solo actúan sobre
tráfico que pasa por el proxy de Cloudflare, y aquí **todos los registros van en DNS only**, de
modo que el tráfico va directo a GitHub sin tocar el edge de Cloudflare. Configurarlos no
tendría ningún efecto.

Quien hace ese trabajo es GitHub: el certificado lo emite Let's Encrypt a través de GitHub
Pages, y la redirección de `http://` a `https://` la aplica la casilla *Enforce HTTPS* del paso
`M4.B4`.

Consecuencia práctica: el token de `M1` con permiso `Zone → DNS → Edit` es **exactamente** el
alcance necesario. No hace falta ampliarlo.

**El proxy naranja queda desactivado de forma permanente.** GitHub emite el certificado
validando por HTTP contra el dominio; si Cloudflare intercepta, la validación no llega y
*Enforce HTTPS* queda deshabilitado. El problema **se repite en cada renovación** (~90 días),
así que activarlo "después" no es una opción segura. GitHub Pages ya sirve por su propia CDN,
de modo que no se pierde rendimiento relevante.

### Fase 3 — Tareas manuales del usuario — ⏳ *pendiente*

`M2` → `M3` → `M6` → `M4`, en ese orden. Auth y App Check antes de exponer el dominio; el
despliegue antes de que GitHub intente validar nada.

Entre `M4.A3` y `M4.A4` hay una **pausa bloqueante**: el usuario entrega el valor del TXT de
verificación y espera a que Claude lo cree en Cloudflare.

### Fase 4 — Verificación — ⏳ *pendiente*

Comprobaciones de Claude:

```bash
dig +short autogastopro.cc          # IPs de GitHub Pages
dig +short www.autogastopro.cc
curl -sSI https://autogastopro.cc              # 200, cert Let's Encrypt válido
curl -sSI http://autogastopro.cc               # 301 a https
curl -sSI https://www.autogastopro.cc          # 301 al apex
curl -sSI https://wally720.github.io/autocontrolapp/   # 301 al dominio nuevo
curl -s https://autogastopro.cc/ | grep assets # bundles en /assets/
```

Comprobaciones del usuario: las 21 del checklist `M7`, que cubren certificado, estilos, login
(valida `M2`), lectura y escritura de datos (valida `M3`), navegación y móvil.

### Fase 5 — Rollback

Reversión rápida y **sin pérdida de datos**; nada de esta migración toca Firestore.

- Borrar el CNAME del apex en Cloudflare, **o**
- revertir el commit de la Fase 1 y volver a desplegar: un `dist/` sin `CNAME` devuelve el
  sitio a `wally720.github.io/autocontrolapp`.
- Los dominios añadidos en Firebase y reCAPTCHA pueden quedarse; no rompen nada.

---

## 7. Decisión explícita: se mantiene HashRouter

`src/main.jsx:15` sigue usando **HashRouter**, así que las URLs quedan como
`https://autogastopro.cc/#/reports`.

Cambiar a `BrowserRouter` en GitHub Pages provoca **404 en cualquier recarga** de `/reports` o
`/admin`, porque Pages no reescribe las rutas hacia `index.html`. El apaño habitual es un
`public/404.html` con redirección vía `sessionStorage`, que tiene casos borde propios.

Queda fuera del alcance **a propósito**. Si en el futuro se quieren URLs limpias, el camino
correcto es mover el hosting a Cloudflare Pages, no parchear GitHub Pages.

---

## 8. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| `npm run deploy` borra el dominio | `public/CNAME` versionado (Fase 1) |
| Login falla con `auth/unauthorized-domain` | `M2`, bloqueante y documentado |
| Firestore deniega permisos pese a login correcto | `M3`. La clave reCAPTCHA tiene lista blanca propia, independiente de Firebase Auth. Es el fallo que más se pasa por alto |
| No se puede activar *Enforce HTTPS* | Proxy en DNS only + auditoría de registros sobrantes en el apex (Paso 2.0) |
| Assets 404 tras el cambio | `base: '/'` verificado sobre `dist/` antes de desplegar |
| Deriva de versión entre `package.json` y `constants.js` | Bump sincronizado, exigido por `AGENTS.md` |
| Documentación desalineada con los paneles reales | Contrastada con documentación oficial; limitación declarada en `00-log-revisiones.md` |

---

## 9. Limitación conocida

Los documentos `M1`–`M7` se contrastaron contra la documentación oficial vigente de Cloudflare,
Firebase, Google Cloud y GitHub, **pero no contra las pantallas reales de las cuentas del
usuario**, a las que Claude no tiene acceso. Los paneles cambian de nombre y de ubicación con
frecuencia: la primera pasada de revisión detectó dos casos ya desactualizados. Si alguna
pantalla no coincide con lo descrito, se corrige en el momento con una captura.

---

## 10. Índice de documentos

| Archivo | Contenido |
|---|---|
| `00-plan-migracion.md` | Este documento. Especificación y fuente de verdad |
| `00-log-revisiones.md` | Registro de las 5 pasadas de revisión y sus 19 hallazgos |
| `M1-cloudflare-api-token.md` | Crear y entregar el API Token de Cloudflare |
| `M2-firebase-authorized-domains.md` | Autorizar el dominio en Firebase Authentication |
| `M3-recaptcha-appcheck-dominios.md` | Autorizar el dominio en reCAPTCHA Enterprise |
| `M4-github-pages-https.md` | Verificar el dominio y activar HTTPS en GitHub Pages |
| `M5-search-console.md` | Alta en Google Search Console (opcional) |
| `M6-desplegar.md` | Desplegar la app al dominio nuevo |
| `M7-checklist-final.md` | Checklist final de verificación, 21 comprobaciones |
