# Proposal: Chunk Loading Performance

## Intent

Make the dashboard feel fast by keeping non-dashboard code out of the initial route graph. The current eager imports can pull Reports, Recharts chart code, and admin-only modules into the app startup path even when users only need the dashboard.

## Scope

### In Scope
- Add dashboard-first lazy route boundaries for non-dashboard sections.
- Keep `DashboardPage` on the eager path.
- Defer Reports/Recharts and admin-only code until users enter those routes.
- Verify the production build and review chunk output.

### Out of Scope
- Changing Firestore data flow or duplicate expense subscriptions.
- Rewriting report UX or chart behavior.
- Manual vendor chunking unless route splitting is insufficient.

## Capabilities

### New Capabilities
- `dashboard-first-loading`: Defines the dashboard as the fast initial experience and requires heavy secondary sections to load on demand.

### Modified Capabilities
- None. No existing `openspec/specs/` files were present, so there are no base capabilities to classify as modified.

## Approach

Use `React.lazy` and `Suspense` in `src/App.jsx` for secondary routes, starting with `ReportsPage` and `AdminDashboard`. Keep the dashboard eager so authenticated users reach the primary screen without fetching chart/admin chunks. If the reports chunk remains too large after route-level splitting, defer chart-heavy report tabs from `src/features/Reports/index.jsx` in a follow-up slice. Treat Vite manual chunks as a validation/cache optimization, not the primary fix.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/App.jsx` | Modified | Add lazy route boundaries and route fallback. |
| `src/pages/ReportsPage.jsx` | Modified | Loaded only when `/reports` is visited. |
| `src/pages/AdminDashboard.jsx` | Modified | Loaded only for admin route access. |
| `src/features/Reports/index.jsx` | Possible | Optional second-stage tab-level splitting. |
| `vite.config.js` | Possible | Optional build/chunk validation tuning. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| First reports/admin navigation shows a delay | Med | Use a clear, lightweight fallback. |
| Lazy fallback causes layout shift | Med | Keep fallback minimal and route-scoped. |
| Route split does not reduce reports chunk enough | Low | Add report-tab lazy loading as a follow-up. |

## Rollback Plan

Revert the route imports in `src/App.jsx` back to static imports and remove the `Suspense` boundary. If any optional report-tab split is added, restore static tab imports in `src/features/Reports/index.jsx`.

## Dependencies

- React 18 `React.lazy` and `Suspense`.
- Existing Vite build output for chunk validation.

## Success Criteria

- [ ] Dashboard route no longer eagerly imports Reports/Recharts/admin route modules.
- [ ] `npm run build` succeeds.
- [ ] Production chunk output shows Reports/Recharts separated from the dashboard-first path.
- [ ] First dashboard render keeps existing behavior and protected-route semantics.
