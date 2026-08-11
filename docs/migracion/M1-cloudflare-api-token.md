# M1 — Crear el API Token de Cloudflare

**Objetivo:** generar una credencial que permita configurar el DNS de `autogastopro.cc`
automáticamente, sin que tengas que crear registros a mano.

**Tiempo estimado:** 3 minutos.
**Cuándo hacerlo:** primero de todo. Nada de la infraestructura avanza sin esto.

---

## Antes de empezar

Necesitas la cuenta de Cloudflare donde está `autogastopro.cc`. Si no recuerdas cuál es, entra a
<https://dash.cloudflare.com> y comprueba que el dominio aparece en la lista de la pantalla
inicial. Si no aparece, estás en la cuenta equivocada: usa el menú de tu correo arriba a la
derecha → *Sign out* y entra con la otra.

---

## Pasos

### 1. Abre la página de tokens

Ve directamente a:

```
https://dash.cloudflare.com/profile/api-tokens
```

Verás una página titulada **API Tokens** con dos secciones. La de arriba es *API Tokens*
(vacía o con tokens previos) y la de abajo *Global API Key*.

> **Si ese enlace no te lleva ahí**, Cloudflare ha movido la pantalla. Hay dos rutas válidas
> según la versión del panel que te toque:
> - **My Profile** (menú de tu correo, arriba a la derecha) → **API Tokens**
> - **Manage Account** (barra lateral izquierda) → **API Tokens**
>
> Las dos llegan al mismo sitio. El resto de los pasos es idéntico.

> ⚠️ **No uses la Global API Key.** Esa clave da acceso total a toda tu cuenta de Cloudflare
> y no se puede limitar ni revocar sin cambiar la contraseña. Vamos a crear un token limitado.

### 2. Pulsa **Create Token**

Es el botón azul a la derecha del título *API Tokens*.

### 3. Elige la plantilla correcta

Se abre una lista de plantillas. Busca la fila que dice:

> **Edit zone DNS** — Edit zone DNS records for a specific zone.

Pulsa el botón **Use template** que está a la derecha de esa fila.

> Si prefieres, puedes usar *Create Custom Token* abajo del todo, pero la plantilla ya trae los
> permisos exactos y evita errores. Usa la plantilla.

### 4. Revisa la sección **Permissions**

Debe quedar exactamente así, con una sola línea:

| Columna 1 | Columna 2 | Columna 3 |
|---|---|---|
| `Zone` | `DNS` | `Edit` |

Si la plantilla trae alguna línea más, bórrala con la **X** al final de la fila.
No añadas permisos adicionales. Con `Zone → DNS → Edit` es suficiente para todo el trabajo.

### 5. Limita el alcance en **Zone Resources**

Esta es la parte importante. Verás tres desplegables seguidos. Déjalos así:

| Desplegable | Valor a elegir |
|---|---|
| Primero | `Include` |
| Segundo | `Specific zone` |
| Tercero | `autogastopro.cc` |

> Si el tercer desplegable dice `All zones`, cámbialo. El token debe poder tocar
> **solo** `autogastopro.cc` y ningún otro dominio.

### 6. Deja el resto como viene

- **Client IP Address Filtering:** vacío. No lo rellenes.
- **TTL (Time to Live):** puedes dejarlo vacío (sin caducidad) o ponerle una fecha de
  caducidad de unos días. Cualquiera de las dos sirve; de todas formas lo vas a revocar
  al final (paso 9).

### 7. Pulsa **Continue to summary**

Botón azul abajo a la derecha. Verás un resumen en una frase. Debe decir algo equivalente a:

> This API token will affect the below accounts and zones... **autogastopro.cc - DNS:Edit**

Si el resumen menciona `All zones`, o menciona permisos distintos a `DNS:Edit`, pulsa
**Back** y corrige. **Comprueba esta frase antes de seguir.**

### 8. Pulsa **Create Token**

Aparece una pantalla verde de confirmación con un recuadro gris que contiene el token: una
cadena larga con letras, números, guiones y guiones bajos.

Según cuándo se cree, tendrá uno de estos dos formatos, y **los dos son válidos**:

- Formato clásico, ~40 caracteres: `aBcD1234_efGH5678-ijKL9012mnOP3456qrST78`
- Formato nuevo, con prefijo `cfut_`: `cfut_aBcD1234_efGH5678-ijKL9012mnOP3456qrST78`

Si el tuyo empieza por `cfut_`, cópialo **incluyendo ese prefijo**. Forma parte del token.

> 🔴 **Este valor se muestra UNA SOLA VEZ.** Si cierras la pantalla sin copiarlo, no hay forma
> de recuperarlo: tendrás que borrar el token y crear otro desde el paso 2.

Pulsa el botón **Copy** que está junto al recuadro.

### 9. Entrégamelo

Pégamelo en el chat, tal cual, en un mensaje. Nada más.

**Qué hago yo con él:**
- Lo uso solo en memoria, durante esta sesión, para llamar a la API de Cloudflare.
- **No** lo escribo en ningún archivo del repositorio.
- **No** lo incluyo en ningún commit ni en el historial de git.
- **No** lo dejo en un `.env`.

**Qué haces tú al terminar la migración:** vuelves a
<https://dash.cloudflare.com/profile/api-tokens>, localizas la fila del token (se llamará algo
como *Edit zone DNS token*), pulsas los tres puntos `···` a la derecha y eliges **Delete**.
A partir de ese momento el token deja de servir para nada. Yo te avisaré cuándo hacerlo.

---

## Cómo comprobar que el token está bien

No hace falta que compruebes nada. En cuanto me lo pases, lo primero que hago es una llamada de
verificación, y te digo en el chat una de estas dos cosas:

- ✅ *"Token válido, veo la zona autogastopro.cc"* → seguimos.
- ❌ *"El token no tiene permiso sobre la zona"* → repetimos desde el paso 2, revisando el
  paso 5 con cuidado. No pasa nada, se crea otro en un minuto.

---

## Problemas frecuentes

**"No veo el botón Create Token".**
Estás en la pestaña *API Keys* en lugar de *API Tokens*. Usa el enlace directo del paso 1.

**"En Specific zone no aparece autogastopro.cc".**
El dominio no está en esta cuenta de Cloudflare, o la transferencia de nameservers aún no ha
terminado. Comprueba en la pantalla inicial de <https://dash.cloudflare.com> que el dominio
figura con estado **Active**. Si dice *Pending nameserver update*, avísame antes de seguir.

**"Copié el token pero no estoy seguro de haberlo copiado entero".**
Pégamelo igual. Si está truncado la verificación falla en el acto y lo sabremos de inmediato,
sin haber roto nada.
