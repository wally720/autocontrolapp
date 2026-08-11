# M5 — Dar de alta autogastopro.cc en Google Search Console (opcional)

**Objetivo:** que Google indexe el dominio nuevo y puedas ver su tráfico de búsqueda.

**Tiempo estimado:** 4 minutos.
**Es OPCIONAL.** La app funciona perfectamente sin esto. Hazlo solo si te interesa aparecer en
Google. Puedes dejarlo para más adelante sin ninguna consecuencia técnica.

---

## Contexto

Había una verificación antigua en el proyecto, en dos sitios:

- una etiqueta `<meta name="google-site-verification">` en `index.html`
- un archivo `google1b22d7ecee5be578.html` en la raíz del repositorio

**Ambos los eliminé** durante la migración. El archivo, además, estaba en la raíz y no dentro de
`public/`, así que Vite nunca lo copiaba al sitio publicado: llevaba tiempo sin servir para
nada. La propiedad vieja apuntaba a la URL antigua y ya no aplica.

Vamos a crear una propiedad nueva, y de un tipo mejor: **propiedad de dominio**, que cubre el
dominio entero (con y sin `www`, http y https) en lugar de una sola URL.

---

## Pasos

### 1. Entra a Search Console

```
https://search.google.com/search-console
```

Inicia sesión con tu cuenta de Google.

### 2. Añade una propiedad

Arriba a la izquierda hay un selector de propiedades. Pulsa en él y elige
**+ Agregar propiedad** (*Add property*).

### 3. Elige el tipo **Dominio**

Se abre un cuadro con dos opciones, una a cada lado:

| Izquierda | Derecha |
|---|---|
| **Dominio** ← *elige esta* | Prefijo de URL |

Pulsa en la caja de la **izquierda** (*Dominio*) y escribe:

```
autogastopro.cc
```

> **Sin** `https://`, **sin** `www`, **sin** barra final. La propiedad de dominio cubre todas
> las variantes automáticamente, que es justo lo que queremos.

Pulsa **Continuar**.

### 4. Cópiame el registro TXT

Google muestra una pantalla titulada *Verificar la propiedad mediante un registro DNS TXT*, con
un recuadro que contiene una cadena que empieza por:

```
google-site-verification=...
```

**Pulsa Copiar y pégamela en el chat.** Yo creo el registro en Cloudflare con el API token.

**No cierres esta ventana de Search Console.** La vas a necesitar en el paso 5.

### 5. Verifica

Cuando te diga *"TXT de Google creado"*, vuelve a la ventana y pulsa **VERIFICAR**.

Debe salir un mensaje verde: *Se ha verificado la propiedad*.

> Si dice que no encuentra el registro, espera 5 minutos y pulsa *Verificar* otra vez. Google a
> veces tarda un poco más que GitHub en leer el DNS. Si tras 15 minutos sigue fallando,
> avísame y lo compruebo desde mi lado.

---

## Después de verificar

No hace falta hacer nada más. Google descubrirá las páginas por su cuenta.

Dos notas realistas para que no te sorprenda:

- **La app tiene URLs con `#`** (`autogastopro.cc/#/reports`). Google no indexa las rutas
  después del `#` como páginas separadas. En la práctica se indexará la portada, que es lo que
  tiene sentido: el resto de la app está detrás de un login y no debe indexarse de todas formas.
- **Puede tardar días** en aparecer datos en Search Console. Es normal, no es un fallo.

Si algún día quieres URLs limpias e indexables página a página, el camino correcto es mover el
hosting a Cloudflare Pages, no parchear GitHub Pages. Lo hablamos cuando quieras.

---

## Problemas frecuentes

**"Solo me deja elegir Prefijo de URL".**
La opción *Dominio* está en la caja de la izquierda y a veces pasa desapercibida porque no
parece un botón. Pulsa directamente sobre el texto *Dominio*.

**"Ya tengo una propiedad vieja del github.io".**
Déjala. No molesta. Si quieres, puedes eliminarla más adelante desde
*Configuración → Eliminar propiedad*, pero perderás su histórico de datos.
