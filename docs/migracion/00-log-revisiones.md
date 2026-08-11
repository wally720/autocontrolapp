# Log de revisiones de la documentación de migración

Registro de las revisiones hechas sobre los documentos `M1`–`M7`.

**Motivo:** en la primera entrega escribí los documentos de una sola pasada y no los revisé
ninguna vez, pese a que se me pidió revisarlos tres veces. Este archivo existe para que las
revisiones sean verificables y no una afirmación mía sin respaldo.

**Alcance:** 5 pasadas. Las tres pedidas originalmente, más dos adicionales con perfiles de
lector distintos.

---

## Pasada 1 — Exactitud contra documentación oficial

**Método:** contraste de cada afirmación sobre paneles externos contra la documentación
vigente de GitHub, Cloudflare, Google Cloud y Firebase (consultada en agosto de 2026).

**Fuentes consultadas:**
- [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [Verifying your custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Cloudflare — Create an API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Cloudflare — CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/) y [Set up CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/set-up-cname-flattening/)
- [Google Cloud — Create a reCAPTCHA key for websites](https://docs.cloud.google.com/recaptcha/docs/create-key-website)
- [GitHub community #23632 — renovación de certificado tras proxy de Cloudflare](https://github.com/orgs/community/discussions/23632)

**Hallazgos y correcciones:**

| # | Documento | Error detectado | Corrección |
|---|---|---|---|
| F1 | M4 | Afirmaba que el certificado tarda "entre 2 y 20 minutos". GitHub documenta que *pueden pasar hasta 24 horas* antes de que *Enforce HTTPS* esté disponible | Se indican ambos plazos: ~15 min habitual, hasta 24 h oficial |
| F2 | M4 | **No mencionaba** que registros `A`/`AAAA`/`ALIAS`/`ANAME` extra en `@`, o un `CNAME` extra en `www`, pueden impedir la emisión del certificado. Cloudflare crea registros por defecto | Añadido como segunda causa conocida; añadida auditoría de zona a mi Fase 2 |
| F3 | M3 | Pedía añadir `www.autogastopro.cc` a la clave de reCAPTCHA. Google documenta que **los subdominios se incluyen solos** | Paso eliminado; añadida explicación de por qué M2 sí lo exige y M3 no |
| F4 | M3 | Ruta de consola obsoleta (*Security → reCAPTCHA*). Ahora es **Google Cloud Fraud Defense**. El interruptor se llama exactamente *"Disable domain verification"* | Ruta actualizada, alternativa por buscador, etiqueta literal corregida |
| F5 | M2 | Situaba *Authorized domains* solo en la pestaña `Settings`. Según versión de consola puede estar al final de `Sign-in method` | Ambas ubicaciones presentadas como igual de válidas, no como nota de problemas |
| F6 | M1 | El ejemplo de token no contemplaba el prefijo nuevo `cfut_`; faltaba la ruta alternativa *Manage Account → API Tokens* | Ambos formatos y ambas rutas documentados |
| F7 | M4 | Faltaba la ruta de navegación manual a la verificación de dominio | Añadida: *Settings → Code, planning, and automation → Pages* |
| F8 | M4 | Afirmaba como hecho documentado que `github.io/repo` redirige al dominio propio. Es comportamiento real pero **no** está en la documentación oficial | Reformulado como comportamiento observado, con el impacto real si no ocurre |

**Confirmaciones (afirmaciones que resultaron correctas):**
- CNAME en el apex vía *CNAME flattening*: activo por defecto en todos los planes, con o sin
  proxy. El diseño DNS del plan es válido.
- El proxy de Cloudflare impide la emisión del certificado de GitHub, y también su renovación
  a los ~90 días. Se confirma la decisión de dejar todo en *DNS only* de forma permanente.
- GitHub crea redirecciones automáticas entre apex y `www`.
- Formato del TXT de verificación: `_github-pages-challenge-<usuario>`.
- El token de Cloudflare se muestra una sola vez.

---

## Pasada 2 — Coherencia interna y contra el código real

**Método:** extracción de todos los literales (dominios, rutas, variables, referencias
cruzadas) de los siete documentos y contraste entre sí y contra los archivos del repositorio.

**Hallazgos:**

| # | Hallazgo | Corrección |
|---|---|---|
| C1 | **Faltaba una tarea manual entera.** El despliegue (`npm run deploy`) solo puede hacerlo el usuario, porque requiere el `.env` con las claves de Firebase, que no está en el repositorio (`.gitignore:71-75`) y cuyo valor no tengo. El plan hablaba de "4 tareas manuales" y en realidad son 5 | Creado `M6-desplegar.md`. El checklist final pasa a `M7` |
| C2 | Numeración rota en M3: los pasos saltaban de 7 a 9 tras eliminar el paso del `www` | Renumerado |
| C3 | La comprobación final de M3 seguía listando 4 dominios esperados, incluido el `www` eliminado | Corregida a 3, con nota de que otros dominios preexistentes son válidos |
| C4 | M4 decía "después del primer despliegue" sin nombrar el documento que lo cubre | Referencia explícita a M6 y orden completo M2 → M3 → M6 → M4 |

**Verificado como coherente:** el dominio se escribe igual en los 7 documentos; las referencias
cruzadas entre M2 y M3 apuntan al documento correcto; el token de M1 sigue vivo cuando M4 y M5
lo necesitan, y su revocación se sitúa al final; los nombres de variables coinciden con
`.env.example`.

---

## Pasada 3 — Ejecución en frío

**Método:** lectura completa de cada documento simulando ser alguien sin contexto previo,
buscando pasos ambiguos, saltos lógicos y puntos de bloqueo.

**Hallazgos:**

| # | Hallazgo | Corrección |
|---|---|---|
| E1 | En M4, el bloque de tiempos quedó pegado al párrafo siguiente sin línea en blanco: en Markdown el texto se absorbía dentro de la cita y el aviso *"Cuándo hacerlo"* se perdía visualmente | Separado |
| E2 | M4 contenía una **pausa bloqueante no señalizada**: entre A3 y A4 hay que esperar a que yo cree el registro TXT. Un lector normal habría pulsado *Verify* de inmediato, visto un fallo, y concluido que el documento estaba mal | Añadido marcador ⏸️ **PARA AQUÍ** con instrucción de dejar la pestaña abierta |
| E3 | M4 no decía qué hacer ante el error `Certificate not yet created`, que es el fallo más probable de todo el proceso | Añadido, con instrucción explícita de **no** quitar y volver a poner el dominio por su cuenta |

---

## Pasada 4 — Lente de administrador de sistemas

**Método:** relectura buscando lo que un sysadmin señalaría: falsos positivos, estado no
verificado, y supuestos sobre la zona DNS.

**Hallazgos:**

| # | Hallazgo | Corrección |
|---|---|---|
| S1 | **Riesgo de falso positivo.** El plan añade registros TXT (SPF, DMARC, verificación de GitHub y Google) en el dominio raíz. Tras leer en M4 que "los registros extra en `@` rompen el certificado", el usuario podría creer que esos TXT son el problema y borrarlos, rompiendo la verificación | Aclarado en M4: la advertencia de GitHub cubre solo `A`, `AAAA`, `ALIAS`, `ANAME` y `CNAME`; los TXT conviven sin conflicto |
| S2 | El estado real de la zona DNS de `autogastopro.cc` **no está verificado**. Puede tener registros por defecto de Cloudflare que entren en conflicto | Convertido en primera acción de mi Fase 2: auditar la zona y reportar antes de crear nada |
| S3 | Ningún documento definía qué pasa si el usuario ejecuta los pasos en orden distinto | Cada documento lleva ahora un bloque *"Cuándo hacerlo"* con sus dependencias explícitas |

---

## Pasada 5 — Lente de persona mayor sin conocimientos técnicos

**Método:** relectura asumiendo cero familiaridad con terminales, DNS, navegadores modernos o
vocabulario de desarrollo. Busca puntos donde el lector se quedaría parado sin saber qué hacer.

**Hallazgos:**

| # | Hallazgo | Corrección |
|---|---|---|
| P1 | **M6 daba órdenes de terminal sin explicar qué es una terminal ni cómo abrirla.** Es con diferencia el documento más difícil, y el único que no era de hacer clic | Añadida sección inicial: cómo abrir la terminal en Windows, Mac y Linux; que cada bloque gris es una orden; cómo pegar en cada sistema |
| P2 | `~/ruta/a/autocontrolapp` podía interpretarse literalmente y copiarse tal cual | Explicado que es un marcador de posición, con el truco de arrastrar la carpeta a la terminal |
| P3 | El checklist final usaba "ventana de incógnito" sin explicar qué es ni por qué importa | M7 incluye el atajo de teclado y la razón |
| P4 | Riesgo de que el usuario interprete la almohadilla `#` de las URLs como un fallo | Señalado como esperado y correcto en M7 |

---

## Estado tras las cinco pasadas

- **19 hallazgos** corregidos (8 + 4 + 3 + 3 + 4).
- Un documento nuevo por una tarea manual que faltaba (`M6`), y renumeración del checklist a `M7`.
- Dos cambios en mi propio trabajo: auditar la zona DNS antes de crear registros (S2), y
  eliminar registros conflictivos en el apex antes de M4 (F2).

**Limitación que sigue en pie, y conviene decirla:** no tengo acceso a las cuentas de
Cloudflare, Firebase ni Google Cloud del usuario. Los documentos están contrastados contra la
documentación oficial vigente, pero **no** contra las pantallas reales de esas cuentas. Los
paneles cambian de nombre y de sitio con frecuencia — la pasada 1 encontró dos casos. Si alguna
pantalla no coincide con lo descrito, es un fallo esperable de este método y se corrige en el
momento con una captura.
