// src/components/Auth/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, allowedStatuses }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!userProfile) {
        return <Navigate to="/pending-access" replace />;
    }

    // Los rechazados van siempre a /pending-access, que explica el motivo.
    // Mandarlos a /login los dejaba en un rebote sin explicacion: ya estaban
    // autenticados, asi que volver a entrar los devolvia al mismo lugar.
    if (allowedStatuses && !allowedStatuses.includes(userProfile.status)) {
        return <Navigate to="/pending-access" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
