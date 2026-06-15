// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import NotificationToast from './components/Notification/NotificationToast';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

const Login = lazy(() => import('./components/Auth/Login'));
const PendingAccess = lazy(() => import('./pages/PendingAccess'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const RouteLoadingFallback = () => (
  <div className="route-loading" role="status" aria-live="polite">
    <span className="route-loading__indicator" aria-hidden="true" />
    <span>Cargando sección...</span>
  </div>
);

function App() {
  return (
    <div>
      <NotificationToast />
      <Navbar />
      <main>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/pending-access" element={<PendingAccess />} />


            {/* Protected Routes (Approved Users Only) */}
            <Route element={<ProtectedRoute allowedStatuses={['approved']} />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} allowedStatuses={['approved']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;


