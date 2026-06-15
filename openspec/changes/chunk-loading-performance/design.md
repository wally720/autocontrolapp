# Design: Chunk Loading Performance

## Technical Approach

Keep the authenticated dashboard on the eager route graph and move secondary routes behind `React.lazy` boundaries in `src/App.jsx`. The first implementation slice should lazy-load `/reports`, `/admin`, and low-priority public routes while preserving the existing `HashRouter`, provider order, protected-route nesting, and Vite `base: '/autocontrolapp/'`. Reports/Recharts stay behind the `/reports` chunk because `ReportsPage` imports `src/features/Reports`, whose chart tabs import `recharts`.

No delta specs exist for this change; this design implements the proposal success criteria directly.

## Architecture Decisions

| Decision | Options considered | Choice and rationale |
|----------|--------------------|----------------------|
| Route split boundary | Lazy every page; lazy only heavy pages; manual chunks | Keep `DashboardPage` eager and lazy-load non-dashboard route elements from `src/App.jsx`. This removes Reports/Recharts/admin modules from startup without touching dashboard behavior. |
| Fallback placement | Global app fallback; route-scoped fallback; no fallback | Wrap only the route element tree in `Suspense` inside `main`. `NotificationToast`, `Navbar`, `ProtectedRoute`, and redirects remain immediate; route content gets a lightweight loading state. |
| Reports depth | Route-level split only; tab-level split now | Start with route-level split. `src/features/Reports/index.jsx` can remain unchanged unless build output shows the reports chunk is still unacceptable. This avoids over-splitting tabs before measuring. |
| Vite chunking | Add `manualChunks`; rely on dynamic imports | Do not change `vite.config.js` initially. Vite will create async chunks from dynamic imports; manual chunks are a follow-up cache optimization, not the primary architecture fix. |

## Data Flow

```text
src/main.jsx
  -> HashRouter + Notification/Auth/Vehicle providers
  -> App.jsx
     -> eager shell: NotificationToast + Navbar + ProtectedRoute + DashboardPage
     -> lazy routes: Login, PendingAccess, ReportsPage, AdminDashboard
        -> /reports loads Reports -> chart tabs -> Recharts only after route chunk fetch
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/App.jsx` | Modify | Import `lazy` and `Suspense`; keep `DashboardPage` eager; replace static non-dashboard page imports with dynamic imports; add a small route fallback. |
| `src/App.css` | Modify | Add optional `.route-loading` styles if the fallback needs a polished layout-consistent state. |
| `src/pages/ReportsPage.jsx` | No source change expected | Becomes an async route chunk through `App.jsx`; keeps existing `Reports` import. |
| `src/pages/AdminDashboard.jsx` | No source change expected | Becomes an async admin-only route chunk through `App.jsx`. |
| `src/features/Reports/index.jsx` | Possible follow-up | Only add tab-level lazy loading if build output proves route-level splitting is insufficient. |
| `vite.config.js` | No source change expected | Keep current Vite config unless later validation requires manual chunk tuning. |
| `package.json`, `package-lock.json`, `src/utils/constants.js` | Modify during implementation | Patch version bump required by local convention for functional/visual changes; keep all three synchronized. |

## Interfaces / Contracts

No new public API or persisted data contract is introduced. The implementation contract is:

```jsx
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

<Suspense fallback={<div className="route-loading">Loading section...</div>}>
  <Routes>{/* existing route structure */}</Routes>
</Suspense>
```

Route paths and authorization behavior must remain unchanged: `/login`, `/pending-access`, `/`, `/reports`, and `/admin`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Existing utility/report calculations | Run `npm test` (`node --test`) to protect current non-React tests. |
| Build | Lazy chunks and syntax | Run `npm run build`; inspect Vite output for separate Reports/Admin async chunks and no initial Recharts path. |
| Manual | Route behavior | In preview/dev, verify dashboard first load, `/reports` fallback then reports, `/admin` protection, login/pending redirects. |

## Migration / Rollout

No migration required. Roll out as a normal SPA build. Rollback is reverting `src/App.jsx` to static imports and removing fallback CSS if added.

## Open Questions

- [ ] None blocking. After implementation, decide from build output whether report-tab lazy loading is worth a follow-up slice.
