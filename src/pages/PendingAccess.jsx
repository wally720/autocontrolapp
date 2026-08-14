// src/pages/PendingAccess.jsx
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import '../components/Auth/Auth.css';

const BLOCKED_COPY = {
    kicker: 'Acceso restringido',
    title: 'Cuenta bloqueada',
    body: [
        'Tu cuenta fue bloqueada por un administrador y no tiene acceso al sistema.',
        'Si creés que se trata de un error, contactá al administrador.',
    ],
};

const PENDING_COPY = {
    kicker: 'Validación requerida',
    title: 'Acceso Pendiente',
    body: [
        'Tu cuenta ha sido registrada correctamente, pero aún está pendiente de aprobación por un administrador.',
        'Por favor, espera a que validemos tu cuenta para poder acceder al sistema.',
    ],
};

const PendingAccess = () => {
    const { userProfile } = useAuth();

    const handleLogout = () => {
        signOut(auth);
    };

    const copy = userProfile?.status === 'blocked' ? BLOCKED_COPY : PENDING_COPY;

    return (
        <div className="auth-container">
            <div className="auth-form auth-form--centered">
                <p className="auth-kicker">{copy.kicker}</p>
                <h2>{copy.title}</h2>
                <p>Hola <strong>{userProfile?.email}</strong>,</p>
                {copy.body.map((line) => <p key={line}>{line}</p>)}
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
