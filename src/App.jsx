// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import Login from './components/Auth/Login';
import NotificationToast from './components/Notification/NotificationToast';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import PendingAccess from './pages/PendingAccess';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';


function App() {
  return (
    <div>
      <NotificationToast />
      <Navbar />
      <main>
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
      </main>
    </div>
  );
}

export default App;


