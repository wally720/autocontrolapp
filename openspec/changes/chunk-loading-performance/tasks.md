# Tasks: Chunk Loading Performance

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 120-220 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr via auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Route-level lazy loading with validation | PR 1 | Single PR; includes build, chunk review, tests, and version bump. |

## Phase 1: Route Boundary Foundation

- [x] 1.1 Modify `src/App.jsx` to import `lazy` and `Suspense` from React while keeping `DashboardPage` eagerly imported.
- [x] 1.2 Replace static imports for `src/components/Auth/Login.jsx`, `src/pages/PendingAccess.jsx`, `src/pages/ReportsPage.jsx`, and `src/pages/AdminDashboard.jsx` with `lazy(() => import(...))` in `src/App.jsx`.

## Phase 2: Deferred Route Implementation

- [x] 2.1 Wrap the existing `<Routes>` tree in a route-scoped `Suspense` fallback inside `src/App.jsx`, preserving `NotificationToast`, `Navbar`, `ProtectedRoute`, and redirects outside disruption.
- [x] 2.2 Add a clear lightweight fallback in `src/App.jsx` and optional `.route-loading` styles in `src/App.css` only if needed for layout consistency.
- [x] 2.3 Preserve route paths and auth behavior for `/login`, `/pending-access`, `/`, `/reports`, and `/admin`.

## Phase 3: Project Convention Updates

- [x] 3.1 Bump the patch version in `package.json`, `package-lock.json`, and `src/utils/constants.js`, keeping all three synchronized.

## Phase 4: Verification

- [x] 4.1 Run `npm test` to protect existing `node:test` utility/report behavior.
- [x] 4.2 Run `npm run build` and verify the production build succeeds.
- [x] 4.3 Review Vite chunk output to confirm Reports/Recharts and admin route code are separated from the dashboard-first startup path.
- [x] 4.4 Manually verify dashboard initial load, protected dashboard redirect, `/reports` deferred fallback, and `/admin` protection behavior.

## Phase 5: Follow-up Decision

- [x] 5.1 If chunk review shows the reports chunk is still unacceptable, document a follow-up for `src/features/Reports/index.jsx` tab-level lazy loading instead of changing `vite.config.js` in this slice.
