# Firestore Rules — Contraste contra el código (Paso 0.5)

Análisis de `firestore.rules` (ruleset publicado en `gastos-auto`, recuperado el 2026-08-14) contra los accesos reales en `src/`. Este documento define los casos de test y guía el endurecimiento.

## Resumen

Las reglas están mejor construidas de lo esperado en `expenses` — la protección vía `authorizedUsers` existe y funciona. El problema está en `users` y `vehicles`, donde `create` no valida contenido en absoluto.

**Hay una escalada de privilegios a admin explotable, y `status` no se verifica en ninguna regla.**

---

## Crítico

### C1 — Escalada a admin en el primer login

`firestore.rules:14`

```
allow create: if request.auth != null && request.auth.uid == userId;
```

El `create` no restringe **ningún campo**. `AuthContext.jsx:29-35,48-54` escribe `status` y `role` desde el cliente, y el cliente no es confiable.

**Explotación:** cualquiera se loguea con Google (el registro está abierto a toda cuenta de Google). En vez de dejar que la app haga el `setDoc`, ejecuta desde la consola del navegador — con la app ya cargada, así que App Check y reCAPTCHA ya están satisfechos y no protegen nada acá:

```js
setDoc(doc(firestore, 'users', currentUser.uid), {
  email: ..., status: 'approved', role: 'admin', vehicles: [], createdAt: ...
})
```

Las reglas lo aceptan. El usuario queda admin, y `isAdmin()` (línea 6-9) lee ese mismo campo, así que gana acceso completo a `users` y `vehicles`.

Es una carrera que el atacante gana siempre: el primer `create` gana, y él controla cuándo se dispara.

**Nota:** `update` (línea 15-18) sí está bien protegido — un no-admin solo puede tocar `vehicles`. El agujero es exclusivamente el `create`.

### C2 — `status` no se verifica en ninguna regla

`status` (`pending` / `approved` / `blocked`) **no aparece en todo el archivo de reglas**. El gate vive únicamente en el cliente: `ProtectedRoute.jsx` y `allowedStatuses={['approved']}` en `App.jsx:37,43`.

A nivel de datos, un usuario `pending` o `blocked` tiene exactamente los mismos permisos que uno `approved`: puede leer todos los vehículos, crear gastos y consultar los suyos vía SDK directo.

**Esto responde la pregunta que originó todo este trabajo:** la aprobación manual **no es una barrera de seguridad**, es una barrera de UI. Bloquear a un usuario desde `AdminDashboard` no le quita el acceso a los datos.

### C3 — Cualquiera crea vehículos con contenido arbitrario

`firestore.rules:26`

```
allow create: if request.auth != null;
```

Sin validar `ownerId`, sin validar `authorizedUsers`, sin validar el formato de la placa. `VehicleSwitcher.jsx:54-59` escribe `ownerId: currentUser.uid` por convención, pero nada lo obliga.

Consecuencias:
- Crear una placa poniendo a otro como `ownerId`.
- **Secuestro de placa:** registrar placas ajenas antes que su dueño real. Como el `create` solo funciona si el doc no existe, el dueño legítimo queda bloqueado para siempre — la app le dirá "ya está registrado por otro usuario" (`VehicleSwitcher.jsx:48`).
- Autoasignarse `authorizedUsers: [uid_propio]` en placas nuevas y, combinado con C4, mapear la flota para elegir objetivos.

## Alto

### A1 — Todos los vehículos son legibles por cualquier usuario

`firestore.rules:24`

```
allow read: if request.auth != null;
```

El comentario lo justifica como "ver si una placa existe al registrarla", pero `allow read` cubre también `list`: cualquier usuario logueado puede **enumerar la flota completa**, con `ownerId` y `authorizedUsers` de cada vehículo. Es un volcado del grafo de usuarios y sus vehículos.

La necesidad real es puntual: un `get` a una placa concreta para saber si existe. No hace falta permitir `list`.

## Medio

### M1 — El comentario de `expenses` miente sobre admin

`firestore.rules:47-51` — el comentario dice "Permitir borrar si es el creador O el dueño del vehículo O admin", pero la condición **no incluye `isAdmin()`**. Un admin no puede borrar gastos. O el comentario está mal, o falta la condición; hay que decidir cuál.

### M2 — `update` de expenses permite mover el gasto a otro vehículo

`firestore.rules:48-51` valida quién actualiza, pero no qué cambia. El creador de un gasto puede reescribir su `vehicleId` apuntando a **cualquier** vehículo, incluido uno al que no tiene acceso — inyectando datos en la contabilidad ajena. `vehicleId` y `userId` deberían ser inmutables tras la creación.

### M3 — `users.vehicles` acepta cualquier placa

`firestore.rules:16` permite al usuario modificar libremente su array `vehicles`. Puede agregar placas ajenas. El impacto es acotado — el acceso real se resuelve contra `vehicles.authorizedUsers`, así que las queries fallarán igual — pero ensucia la UI y no debería ser posible.

## Bajo / observaciones

### O1 — Costo de `get()` en las lecturas de expenses

`firestore.rules:36` hace un `get()` al vehículo dentro de `allow read`. En la query de `useExpenses.js:30-34` esa regla se evalúa **por documento devuelto**, así que cada gasto listado suma una lectura extra facturable. Confirma el riesgo anticipado en el plan. A medir en el emulador antes de decidir si conviene denormalizar `authorizedUsers` dentro de cada gasto.

### O2 — Índice huérfano

`firestore.indexes.json:3-25` define `userId + vehicleId + date`. El código ya no filtra por `userId` — el comentario en `useExpenses.js:28` dice explícitamente "Ahora filtramos SOLO por vehicleId". Es un índice muerto que solo cuesta escrituras. Candidato a borrar.

---

## Lo que está bien (no tocar)

- **Sin catch-all.** No hay ningún `match /{document=**}` permisivo. El deny por defecto se cumple.
- **Sin colecciones huérfanas.** `users`, `vehicles` y `expenses` cubren exactamente lo que el código usa.
- **`create` de expenses** (líneas 43-45) es la mejor regla del archivo: valida `userId` contra el caller y verifica autorización contra el vehículo.
- **`update` de users** (líneas 15-18) usa `diff().affectedKeys().hasOnly()` correctamente para blindar `status` y `role`. Es justo el patrón que le falta al `create`.
- **`delete` de users y vehicles** no está declarado, así que queda denegado. Correcto.

---

## Parche aplicado a C1 (2026-08-14)

`allow create` en `/users/{userId}` ahora exige `role == 'user'` y `email == request.auth.token.email`, además de la ownership que ya tenía.

Decisiones tomadas y por qué:

- **Solo se restringen los campos que otorgan poder.** Una allowlist rígida de campos (`hasOnly` + `hasAll`) se descartó: rompería el alta de usuarios nuevos el día que alguien agregue un campo al perfil, y lo haría en producción, en silencio, sin fallar en build ni en tests — el `create` no vuelve a correr para usuarios que ya existen, así que quien desarrolla nunca lo ve.
- **`status` no se valida a propósito.** Por C2, `status` no gatea ningún dato en estas reglas: solo decide qué pantalla muestra el cliente. Forzarlo en el `create` agregaría fragilidad sin comprar seguridad, y la restricción de aprobación manual está planificada para desaparecer.
- **`vehicles == []` y `createdAt is string` se descartaron.** La primera es engañosa (el `update` permite modificar `vehicles` libremente, así que restringir solo el `create` no protege nada); la segunda rompería una migración a `serverTimestamp()`, que sería la mejora correcta.

**Consecuencia asumida:** un usuario nuevo puede crearse con `status: 'approved'` y saltarse la aprobación manual. No cambia su acceso a datos — por C2, un `pending` ya tiene los mismos permisos — solo se adelanta a la apertura del registro que ya está planificada.

Criterio general: cada condición en una regla debe pagar su costo de fragilidad con seguridad real. La red contra cambios futuros son los tests del Paso 2, no condiciones más estrictas.

## Endurecimiento completo (2026-08-14)

Estado final de cada hallazgo. Cada uno tiene su test en `firestore.rules.test.js`; correr con `npm run test:rules`.

| | Estado | Cómo |
|---|---|---|
| C1 | Cerrado | `create` de `users` fuerza `role == 'user'` y `email == token.email` |
| C2 | Cerrado | `isNotBlocked()` aplicado a `vehicles` y `expenses` |
| C3 | Mitigado | `create` de `vehicles` exige `ownerId` propio y `authorizedUsers` de un solo elemento |
| A1 | Cerrado | `read` separado en `get` (cualquiera) y `list` (solo admin) |
| M1 | Cerrado | `isAdmin()` agregado a `update`/`delete` de `expenses` |
| M2 | Cerrado | `vehicleId` y `userId` inmutables en `update` de `expenses` |
| M3 | Mitigado | Tope anti-abuso de 20 en `users.vehicles` |

### Decisiones de diseño

**`isNotBlocked()` valida contra `blocked`, no contra `approved`.** Así bloquear a alguien es una expulsión real sin atar las reglas a la aprobación manual. Esa previsión se cumplió: el registro se abrió el mismo día (`AuthContext` ahora crea los perfiles como `approved`) sin tocar una sola línea de este archivo.

No se aplica al perfil propio ni al `create` de `users`: un usuario bloqueado tiene que poder leer su doc para que la UI se lo diga, y el `create` corre antes de que el doc exista.

**El `get()` de `status` usa default explícito.** Acceder a un campo inexistente en CEL es un error de evaluación, no `null`. Sin `data.get('status', 'active')`, cualquier perfil sin `status` quedaría bloqueado de toda la app. Lo detectó un test, no una revisión a ojo.

**`get` de `vehicles` queda abierto a propósito.** `VehicleSwitcher.jsx:41-50` necesita consultar una placa concreta para saber si ya está registrada. Residual asumido: quien adivine una patente puede ver su `ownerId` y `authorizedUsers`. Es mucho menos que enumerar la flota entera, que era lo que permitía `list`.

**El tope de 20 en `users.vehicles` es anti-abuso, no el límite de producto.** `MAX_VEHICLES_PER_USER` (2) vive en `src/utils/constants.js`; separarlos evita que cambiar una regla de negocio obligue a redeployar reglas de seguridad.

### Residuales asumidos

- **C3 — reservar una placa ajena sigue siendo posible.** La patente es el ID del documento y es global; nada le prueba a Firestore que una patente es tuya. Un atacante puede registrar una placa que no le pertenece y dejar afuera al dueño real de forma permanente. Cerrarlo requiere un flujo de reclamo o verificación de titularidad, que es diseño de producto, no reglas.
- **M3 — un usuario puede meter placas ajenas en su propio array `vehicles`.** Validar la pertenencia exigiría un `get()` por placa en cada update. El acceso real se resuelve contra `vehicles.authorizedUsers`, así que solo ensucia su propia navegación.
- **O1 — costo de `get()` por documento** en las lecturas de `expenses`. Sigue pendiente de medición.
- **O2 — índice huérfano** `userId + vehicleId + date`. Sigue publicado; los deploys de reglas usan `--only firestore:rules` y no lo tocan.

## Impacto en el plan

1. Los casos de test del Paso 2 salen de C1, C2, C3, A1, M1, M2 y M3.
2. El Paso 3 debe verificar `status == 'approved'` en las reglas, no solo blindar campos. Es un cambio de alcance respecto de lo planificado.
3. **La tarea "quitar la aprobación manual" cambia de sentido.** No se puede evaluar como fricción de producto mientras C1 y C2 estén abiertos: hoy la aprobación no protege datos, y con C1 vivo cualquier registro nuevo puede volverse admin. Se decide después de cerrar ambos.
