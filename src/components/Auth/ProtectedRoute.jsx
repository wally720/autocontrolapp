// src/components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, allowedStatuses }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (userProfile) {
        if (allowedStatuses && !allowedStatuses.includes(userProfile.status)) {
            if (userProfile.status === 'pending') {
                return <Navigate to="/pending-access" replace />;
            }
            return <Navigate to="/login" replace />;
        }

        if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
