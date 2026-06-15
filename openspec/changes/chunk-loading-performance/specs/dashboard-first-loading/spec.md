# Dashboard-First Loading Specification

## Purpose

Define the dashboard as the fast initial authenticated experience while deferring secondary route code until users intentionally enter those routes.

## Requirements

### Requirement: Fast Dashboard Initial Experience

The system MUST keep the dashboard route on the eager startup path and MUST preserve existing protected-route behavior for authenticated users.

#### Scenario: Authenticated user enters dashboard

- GIVEN an authenticated user opens the app at the dashboard route
- WHEN the application initializes
- THEN the dashboard becomes available without requiring reports, charting, or admin route modules to load first

#### Scenario: Protected access remains enforced

- GIVEN an unauthenticated user attempts to open the dashboard route
- WHEN route protection evaluates the request
- THEN the user is redirected according to the existing authentication flow

### Requirement: Lazy Secondary Routes

The system MUST lazy-load non-dashboard route components so secondary route code is fetched only when the user navigates to those sections.

#### Scenario: Dashboard-only session avoids secondary route code

- GIVEN an authenticated user uses only the dashboard
- WHEN the user does not navigate to reports, admin, login, or pending-access routes
- THEN non-dashboard route component code is not required for the dashboard experience

#### Scenario: Secondary route loads on demand

- GIVEN an authenticated user is on the dashboard
- WHEN the user navigates to a lazy secondary route
- THEN the route component is loaded on demand before that route renders

### Requirement: Reports, Recharts, and Admin Deferral

The system MUST defer Reports, Recharts-backed report code, and admin-only route code until the corresponding route is entered.

#### Scenario: Reports dependency waits for reports route

- GIVEN a user opens the dashboard route
- WHEN the reports route has not been visited
- THEN reports UI code and Recharts-backed report modules are not part of the dashboard-first route requirement

#### Scenario: Admin dependency waits for admin route

- GIVEN a non-admin or admin user opens the dashboard route
- WHEN the admin route has not been visited
- THEN admin-only route code is not required for initial dashboard availability

### Requirement: Deferred Route Fallback

The system MUST show a clear, lightweight, route-scoped fallback while a deferred route is loading.

#### Scenario: Slow deferred navigation

- GIVEN a deferred route chunk is still loading
- WHEN the user navigates to that route
- THEN a loading fallback is displayed until the route component is ready

#### Scenario: Fallback avoids dashboard disruption

- GIVEN the user remains on the dashboard route
- WHEN no deferred route navigation is active
- THEN no deferred-route fallback interrupts the dashboard content

### Requirement: Build and Chunk Validation

The system MUST validate the change with a production build and SHOULD review emitted chunks to confirm reports/charting/admin code is separated from the dashboard-first path.

#### Scenario: Production build succeeds

- GIVEN the lazy-loading change is implemented
- WHEN `npm run build` is executed
- THEN the production build completes successfully


#### Scenario: Chunk output confirms separation

- GIVEN the production build output is available
- WHEN the emitted chunks are reviewed
- THEN reports, Recharts-backed code, and admin route code are separated from the dashboard-first startup path
