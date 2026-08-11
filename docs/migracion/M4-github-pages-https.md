# M4 — Configurar el dominio y activar HTTPS en GitHub Pages

**Objetivo:** que GitHub emita el certificado SSL de `autogastopro.cc` y fuerce HTTPS.

**Tiempo estimado:** 5 minutos de clics + espera del certificado (ver aviso abajo).

> ⏱️ **Sobre la espera del certificado, para que no te desesperes.** En la práctica, con el
> DNS bien puesto y sin proxy, suele tardar **unos 15 minutos**. Pero la documentación oficial
> de GitHub avisa de que *"pueden pasar hasta 24 horas antes de que esta opción esté
> disponible"*. Las dos cosas son ciertas: normalmente es rápido, y ocasionalmente no lo es.
> **No des el paso por fallido hasta pasadas 24 horas**, salvo que veas un mensaje de error
> explícito en pantalla.

**Cuándo hacerlo:** **después** de M2, M3 y M6 (el despliegue), y después de que yo haya
configurado el DNS en Cloudflare. Yo te avisaré con estas palabras exactas:
*"DNS listo y desplegado, adelante con M4"*.

Si lo haces antes, GitHub no podrá validar el dominio y verás errores que no significan nada.

---

## Parte A — Verificación del dominio (recomendado, se hace una vez)

Esto impide que otra persona pueda reclamar `autogastopro.cc` desde otro repositorio de GitHub.
Es rápido y evita un secuestro de dominio.

### A1. Abre la configuración de páginas de tu cuenta

```
https://github.com/settings/pages
```

Ojo: es la configuración **de tu cuenta**, no la del repositorio. Se titula *Pages*.

Si prefieres navegar a mano: foto de perfil (arriba a la derecha) → **Settings** → en la barra
lateral izquierda, sección **Code, planning, and automation** → **Pages**.

### A2. Añade el dominio

Pulsa **Add a domain**. En el campo escribe:

```
autogastopro.cc
```

Pulsa **Add domain**.

### A3. Copia los dos valores que te da

GitHub muestra una tabla con un registro TXT que debes crear, con dos datos:

- Un **nombre**, del estilo `_github-pages-challenge-wally720`
- Un **valor**, una cadena larga de letras y números

**Cópiame los dos y pégamelos en el chat.** Yo creo el registro en Cloudflare con el API token.

> ⏸️ **PARA AQUÍ.** No pulses *Verify* todavía. El registro TXT aún no existe: tengo que
> crearlo yo primero. Si pulsas *Verify* ahora, fallará y no pasa nada grave, pero no avances
> hasta que te confirme. **Deja esta pestaña del navegador abierta.**

### A4. Espera mi confirmación y verifica

Cuando te diga *"TXT creado"*, vuelve a esta pantalla y pulsa **Verify**.
Debe aparecer una etiqueta verde **Verified** junto al dominio.

> Si dice que no encuentra el registro, espera 2 minutos y pulsa *Verify* otra vez. El DNS
> tarda un poco en propagarse.

---

## Parte B — Dominio y HTTPS en el repositorio

### B1. Abre la configuración de Pages del repositorio

```
https://github.com/wally720/autocontrolapp/settings/pages
```

### B2. Comprueba el campo *Custom domain*

Debería mostrar ya **`autogastopro.cc`**, rellenado automáticamente.

> **¿Por qué ya está puesto?** Porque añadí el archivo `public/CNAME` al proyecto. Vite lo
> copia a la carpeta publicada en cada build, y GitHub lo lee y configura el dominio solo.
>
> Esto **no es un detalle menor**: el comando `npm run deploy` reescribe la rama `gh-pages`
> entera cada vez. Si el dominio se hubiera puesto solo desde esta pantalla, el siguiente
> despliegue lo habría borrado y el sitio se habría caído. Al vivir en el código, sobrevive
> a todos los despliegues.

**Si el campo está vacío:** escríbelo a mano (`autogastopro.cc`, sin `https://`, sin barra
final) y pulsa **Save**. Y avísame, porque significa que el despliegue no incluyó el CNAME y
hay que revisarlo.

**Si el campo tiene otro valor:** no lo cambies y avísame antes de tocar nada.

### B3. Espera al certificado

Justo debajo del campo verás un mensaje de estado. Pasará por estas fases:

1. `DNS Check in Progress` — GitHub está comprobando el DNS. Normal, espera.
2. `Certificate is being provisioned` — está emitiendo el certificado SSL. Normal, espera.
3. ✅ `Your site is live at https://autogastopro.cc` — listo.

Recarga la página cada pocos minutos. No pulses nada mientras tanto; no acelera el proceso y sí
puede reiniciarlo.

> Si ves el error **`Certificate not yet created`**, significa que la comprobación automática
> de DNS de GitHub no cuadra todavía. Antes de tocar nada, espera. La documentación de GitHub
> sugiere quitar y volver a poner el dominio para reiniciar el proceso, pero **no lo hagas por
> tu cuenta**: avísame primero, porque quitar el dominio también borra el estado y podemos
> acabar dando vueltas. Lo diagnostico yo desde el DNS.

### B4. Marca *Enforce HTTPS*

Cuando el certificado esté emitido, la casilla **Enforce HTTPS** deja de estar gris.
**Márcala.**

Esto hace que cualquiera que entre por `http://` sea redirigido a `https://`.

> **Si la casilla sigue gris pasadas unas horas**, no sigas intentándolo: avísame. Hay dos
> causas conocidas, las dos del lado del DNS y las dos me tocan a mí, no a ti:
>
> 1. **Proxy de Cloudflare activado** (nube naranja) en algún registro. GitHub valida el
>    certificado con una petición HTTP directa al dominio; si Cloudflare la intercepta, la
>    validación nunca llega. Por eso todo va en *DNS only*.
> 2. **Registros sobrantes en el apex.** GitHub avisa de que cualquier registro `A`, `AAAA`,
>    `ALIAS` o `ANAME` adicional con host `@`, o un `CNAME` extra apuntando al subdominio
>    `www`, *"puede impedir que se genere el certificado HTTPS"*. Cloudflare a veces crea
>    registros por defecto al añadir un dominio. Yo audito la zona y elimino los que sobren
>    antes de que llegues a este paso.
>
> **Aclaración por si miras el DNS y te alarmas:** en la zona habrá también registros **TXT**
> en el dominio raíz (los de SPF, DMARC y las verificaciones de GitHub y Google). Esos son
> normales y **no** interfieren con el certificado: la advertencia de GitHub se refiere solo a
> registros de tipo `A`, `AAAA`, `ALIAS`, `ANAME` y `CNAME`. Los TXT pueden convivir sin
> problema.

---

## Cómo comprobar que todo quedó bien

Abre en el navegador:

1. `https://autogastopro.cc` → carga la app, y el candado de la barra de direcciones está
   cerrado y sin advertencias.
2. `http://autogastopro.cc` (sin la ese) → te redirige solo a `https://`.
3. `https://www.autogastopro.cc` → te redirige a `https://autogastopro.cc`.
4. `https://wally720.github.io/autocontrolapp/` → te redirige al dominio nuevo.
   *(GitHub hace esta redirección automáticamente al fijar un dominio propio, por efecto del
   archivo CNAME. Es el comportamiento real observado, aunque GitHub no lo documenta de forma
   explícita. Si no redirigiera, no sería un fallo grave: la app seguiría funcionando en el
   dominio nuevo. Avísame y lo miramos.)*

Dime **"M4 hecho"** y yo corro las comprobaciones técnicas por mi cuenta para confirmarlo desde
fuera de tu navegador (que puede estar cacheando cosas).

---

## Problemas frecuentes

**"Dice: Domain does not resolve to the GitHub Pages server".**
El DNS todavía no se ha propagado. Espera 10 minutos. Si persiste, avísame y lo reviso.

**"Dice: Both autogastopro.cc and its alternate name are improperly configured".**
Suele ser temporal durante la propagación. Si sigue igual pasada media hora, avísame.

**"El sitio carga pero sin estilos, todo se ve en blanco y negro".**
Eso sería un problema de rutas de los archivos, no de dominio. Avísame de inmediato con una
captura: significa que algo del build no quedó bien y hay que revertir. Lo verifiqué antes de
desplegar, así que no debería pasar.

**"Marqué Enforce HTTPS y ahora sale error de certificado".**
Espera 5 minutos y prueba en incógnito. Si persiste, desmarca la casilla y avísame.
