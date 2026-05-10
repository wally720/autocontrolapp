// src/pages/PendingAccess.jsx
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import '../components/Auth/Auth.css';

const PendingAccess = () => {
    const { userProfile } = useAuth();

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <div className="auth-container">
            <div className="auth-form auth-form--centered">
                <p className="auth-kicker">Validación requerida</p>
                <h2>Acceso Pendiente</h2>
                <p>Hola <strong>{userProfile?.email}</strong>,</p>
                <p>Tu cuenta ha sido registrada correctamente, pero aún está pendiente de aprobación por un administrador.</p>
                <p>Por favor, espera a que validemos tu cuenta para poder acceder al sistema.</p>
                <button
                    onClick={handleLogout}
                    className="auth-button"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default PendingAccess;
