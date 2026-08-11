# M7 — Checklist final de verificación

**Objetivo:** confirmar, con pruebas reales, que la migración quedó bien y no hay nada roto.

**Cuándo:** cuando M4 esté hecho y yo te haya dicho que las comprobaciones técnicas pasan.

Esta es la única parte que no puedo verificar yo: hace falta un navegador con tu sesión de
Google iniciada. Son 5 minutos.

---

## Cómo hacer las pruebas

**Usa una ventana de incógnito** (`Ctrl+Shift+N` en Chrome, `Cmd+Shift+N` en Mac).

> ¿Por qué? Tu navegador normal tiene guardada la versión vieja de la app y tu sesión abierta.
> En incógnito todo se carga de cero, que es lo que ve un usuario real. Sin esto, podrías dar
> por bueno algo que en realidad está roto, o por roto algo que solo es caché.

Ve marcando cada casilla. **Si alguna falla, para ahí y avísame** indicando el número: cada
fallo apunta a una causa distinta y así lo diagnostico en un minuto.

---

## Checklist

### Acceso y certificado

- [ ] **1.** `https://autogastopro.cc` abre la app.
- [ ] **2.** El candado de la barra de direcciones está cerrado, sin advertencias ni avisos de
      "No seguro".
- [ ] **3.** `http://autogastopro.cc` (sin la ese) redirige solo a `https://`.
- [ ] **4.** `https://www.autogastopro.cc` redirige a `https://autogastopro.cc`.
- [ ] **5.** `https://wally720.github.io/autocontrolapp/` redirige al dominio nuevo.

### Aspecto visual

- [ ] **6.** La app se ve **con estilos y colores**, no como texto plano en blanco y negro.
- [ ] **7.** El **logo** aparece en la barra superior (no un icono de imagen rota).
- [ ] **8.** El **favicon** (icono pequeño de la pestaña del navegador) se ve.

> Un fallo en 6, 7 u 8 apunta a rutas de archivos, es decir al cambio de `base` en la
> configuración. Avísame de inmediato: es el tipo de fallo que se arregla rápido pero conviene
> no dejarlo.

### Inicio de sesión — *valida M2*

- [ ] **9.** Se ve el botón de iniciar sesión con Google.
- [ ] **10.** Al pulsarlo se abre la ventana de Google **y no se cierra sola**.
- [ ] **11.** Eliges tu cuenta y entras a la app.

> Si la ventana se abre y se cierra al instante, o no llegas a entrar, el problema es **M2**
> (dominios autorizados de Firebase Authentication).

### Datos — *valida M3*

- [ ] **12.** El dashboard carga y **se ven tus vehículos**.
- [ ] **13.** Se ven tus gastos registrados, con sus importes.
- [ ] **14.** Puedes entrar a **Reportes** y los gráficos se dibujan con datos.

> ⚠️ **Este es el bloque crítico.** Si entraste bien (11 ✅) pero aquí no aparecen datos, o sale
> un error de permisos, el problema es **M3** (dominios de la clave reCAPTCHA / App Check).
> No es un fallo de la app ni se han perdido datos: es la lista blanca del dominio.

### Navegación

- [ ] **15.** Navegas a Reportes y la URL queda como `https://autogastopro.cc/#/reports`.
- [ ] **16.** Con esa URL abierta, **recargas la página (F5)** y la app vuelve a cargar sin
      error 404.
- [ ] **17.** Si tu usuario es administrador, `https://autogastopro.cc/#/admin` abre el panel.

> La almohadilla `#` en la URL es **esperada y correcta**, no es un fallo. Es cómo funciona la
> app hoy. Cambiarla exigiría mover el hosting, y lo dejamos deliberadamente fuera de esta
> migración.

### Escritura de datos

- [ ] **18.** Registras un gasto de prueba y se guarda.
- [ ] **19.** Recargas la página y **el gasto sigue ahí**.
- [ ] **20.** Borras el gasto de prueba.

> Los pasos 18-20 confirman que la escritura en la base de datos funciona, no solo la lectura.
> Es la prueba definitiva de que App Check está aceptando el dominio nuevo.

### Móvil

- [ ] **21.** Abres `https://autogastopro.cc` en tu teléfono y funciona: carga, entras y ves
      los datos.

---

## Cuando todo esté marcado

Dime **"M7 completo"**. Entonces yo:

1. Corro las comprobaciones técnicas finales desde fuera de tu navegador.
2. Te aviso para que **revoques el API Token de Cloudflare** (último apartado de `M1`).
3. Cierro la migración y actualizo la documentación del repositorio.

---

## Si algo falla: guía rápida de diagnóstico

| Qué falla | Causa más probable | Documento a revisar |
|---|---|---|
| 1, 2, 3, 4 | DNS o certificado | `M4` — avísame, lo reviso yo |
| 5 | Redirección del dominio viejo | Menor, no bloquea nada |
| 6, 7, 8 | Rutas de archivos (`base`) | Avísame de inmediato |
| 9, 10, 11 | Dominios de Firebase Auth | `M2` |
| 12, 13, 14, 18, 19 | Dominios de reCAPTCHA / App Check | `M3` |
| 16 (404 al recargar) | Avísame — no debería pasar con `#` | — |

### Cómo darme información útil de un fallo

Si algo falla, esto me ahorra media hora de adivinanzas:

1. Pulsa **F12** para abrir las herramientas del navegador.
2. Ve a la pestaña **Console**.
3. Recarga la página.
4. Hazme una captura de los mensajes en rojo que aparezcan.

Con eso identifico la causa exacta casi siempre a la primera.

---

## Marcha atrás

Si algo sale mal y quieres volver al estado anterior mientras lo arreglamos, se puede en
minutos y **sin perder ningún dato**: nada de esta migración toca la base de datos. Dímelo y
lo hago; el procedimiento está en el plan, sección *Fase 5 — Rollback*.
