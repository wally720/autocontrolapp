## Exploration: chunk-loading-performance

### Current State
The app is a Vite + React 18 SPA using `HashRouter` and a single eager application entry. `src/main.jsx` mounts global providers before `App`, and `src/App.jsx` statically imports all routed pages: dashboard, reports, login, pending access, and admin. Because `ReportsPage` statically imports `features/Reports`, the initial bundle can include the full reports module graph even when the user lands on the dashboard. Inside `features/Reports/index.jsx`, every report tab is statically imported; `MonthlyEvolution.jsx` and `CategoryDistribution.jsx` import `recharts`, so charting code is reachable from the initial route graph. `AdminDashboard.jsx` is also statically imported from `App.jsx`, adding admin-only code to the main route graph. `vite.config.js` has no chunking or build analysis configuration. OpenSpec scaffolding (`openspec/config.yaml`, `openspec/specs/`) was not present before this exploration.

### Affected Areas
- `src/App.jsx` — central route composition currently eager-loads all pages; primary place to introduce route-level `React.lazy` and `Suspense` for non-dashboard routes.
- `src/pages/ReportsPage.jsx` — page boundary for reports; lazy-loading it can keep reports and Recharts out of the dashboard-first path.
- `src/features/Reports/index.jsx` — statically imports every report tab and report CSS; a second-stage split could lazy-load individual heavy tabs.
- `src/features/Reports/MonthlyEvolution.jsx` — imports Recharts bar chart primitives.
- `src/features/Reports/CategoryDistribution.jsx` — imports Recharts pie chart primitives.
- `src/pages/AdminDashboard.jsx` — admin-only route currently included in the eager `App.jsx` import graph.
- `src/hooks/useExpenses.js`, `src/features/ExpenseForm.jsx`, `src/features/ExpenseHistory.jsx` — dashboard components each instantiate the expenses hook; not the chunk-size root cause, but relevant to dashboard perceived loading because it can create duplicate Firestore subscriptions.
- `vite.config.js` — possible place for manual chunking or bundle analysis, but not the first-choice product fix.

### Approaches
1. **Dashboard-first route lazy loading** — Keep `DashboardPage` eager and convert Reports/Admin/Pending/Login as appropriate to `React.lazy` route components with a small `Suspense` fallback.
   - Pros: Directly protects the first dashboard load, isolates Recharts behind `/reports`, small code change, aligns with the user's acceptable approach.
   - Cons: First navigation to reports/admin pays a one-time chunk fetch; fallback UX must be polished enough not to feel broken.
   - Effort: Low

2. **Deep lazy loading inside Reports** — Lazy-load individual report panels or at least chart-heavy tabs (`MonthlyEvolution`, `CategoryDistribution`) from `features/Reports/index.jsx`.
   - Pros: Reduces the initial `/reports` chunk and delays Recharts usage until chart tabs are opened.
   - Cons: More moving parts, tab-level loading states needed, risk of over-splitting small report modules.
   - Effort: Medium

3. **Vite manual chunks / vendor splitting** — Configure `build.rollupOptions.output.manualChunks` to split large dependencies such as Recharts/Firebase/vendor libraries.
   - Pros: Can silence or reduce large chunk warnings and improve cache behavior for repeat visits.
   - Cons: Does not automatically improve dashboard-first loading if the dashboard still imports routes that reference those chunks; can mask architecture coupling instead of fixing it.
   - Effort: Low to Medium

### Recommendation
Start with dashboard-first route lazy loading in `src/App.jsx`, keeping `DashboardPage` eager and lazy-loading `ReportsPage` and `AdminDashboard` at minimum. This should remove Recharts and admin-only code from the dashboard's initial route graph with the least risk. If the reports chunk remains large after that, add a second stage to lazy-load chart-heavy report tabs from `features/Reports/index.jsx`. Treat Vite manual chunking as a validation/cache optimization after architectural lazy boundaries are in place, not as the primary fix.

### Risks
- Lazy route fallbacks can create layout shifts or a poor transition if they are too generic.
- Route-level lazy loading will make the first `/reports` visit fetch an extra chunk; on slow networks this needs a clear loading state.
- `Reports/index.jsx` still imports all report tabs once `/reports` loads, so route-level splitting may not be enough if report navigation itself must be very fast.
- Dashboard perceived performance may still be affected by duplicated `useExpenses` subscriptions in `ExpenseForm` and `ExpenseHistory`; solving that is a separate data-flow change.
- OpenSpec base files were missing, so downstream SDD phases may need to initialize or tolerate absent `openspec/config.yaml` and main specs.

### Ready for Proposal
Yes — the proposal should frame this as a performance/refactor change focused on dashboard-first loading: add lazy route boundaries for non-dashboard sections, verify with `npm run build`, and optionally follow with report-tab lazy loading if the reports chunk remains too large.
