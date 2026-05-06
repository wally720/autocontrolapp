# Guía para Agentes - Auto Gasto PRO

## Comandos verificados
- Dev: `npm run dev` (Vite).
- Tests: `npm test` usa `node --test`; no asumas Vitest/Jest.
- Test individual: `node --test ruta/al/archivo.test.js`.
- Lint: `npm run lint` ejecuta ESLint con `--max-warnings 0`; actualmente puede fallar por deuda existente, no lo reportes como verde sin correrlo.
- Build: `npm run build`. Preview: `npm run preview`.
- Deploy: `npm run deploy`; `predeploy` buildea y luego `gh-pages -d dist` publica. No hay script de clean.

## Arquitectura que importa
- SPA Vite + React 18 + Firebase, ESM (`type: module`). Entrada real: `src/main.jsx`.
- Routing con `HashRouter`; `vite.config.js` usa `base: '/autocontrolapp/'` para GitHub Pages.
- Providers globales en orden: `NotificationProvider > AuthProvider > VehicleProvider > App`.
- Rutas públicas: `/login`, `/pending-access`; protegidas: `/`, `/reports`; admin: `/admin`.
- Firebase se centraliza en `src/config/firebase.js`: Auth, Firestore, Google provider y App Check reCAPTCHA Enterprise.
- `src/hooks/useExpenses.js` consulta gastos por `vehicleId`, no por `userId`; no cambies ese límite sin revisar reglas/modelo de Firestore.

## Convenciones locales
- `src/features/`: lógica de negocio reutilizable (por ejemplo `ExpenseForm`, `Reports`).
- `src/pages/`: vistas conectadas al router; revisá `src/features` antes de duplicar lógica en páginas.
- `src/context/`: estado global real de Auth, Vehicle y Notification.
- Tests junto al archivo testeado, con `node:test` + `node:assert/strict`.
- CSS puro junto al componente (`.css` al lado de `.jsx`).
- Antes de reimplementar fechas, moneda o cálculos de combustible, mirá `src/utils/` y `src/features/Reports/fuelUtils.js`.

## Gotchas de entorno
- `.env.example` define las claves `VITE_FIREBASE_*`, incluyendo `VITE_FIREBASE_RECAPTCHA_KEY` para App Check.
- App Check puede requerir debug token en local; revisá `src/config/firebase.js` antes de diagnosticar errores Firebase genéricos.
- Reportes usan `recharts`; cambios en `src/features/Reports/` deben cuidar compatibilidad con ese stack.
- `package.json` y `package-lock.json` pueden tener versiones de app distintas; no uses eso como señal de cambios funcionales sin verificar.
