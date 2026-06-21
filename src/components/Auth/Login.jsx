// src/components/Auth/Login.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaCar } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

const Login = () => {
    const { loginWithGoogle, loginWithEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [devEmail, setDevEmail] = useState('');
    const [devPassword, setDevPassword] = useState('');
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            console.error(err);
            showNotification('Error al iniciar sesión con Google. Intentá de nuevo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDevSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginWithEmail(devEmail, devPassword);
            navigate('/');
        } catch (err) {
            console.error(err);
            showNotification('Error al iniciar sesión. Verificá las credenciales.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form auth-form--centered">
                <div className="auth-logo">
                    <FaCar className="auth-logo-icon" />
                    <h1>Auto Gasto PRO</h1>
                </div>

                <h2>Bienvenido</h2>
                <p className="auth-lead">
                    Inicia sesión de forma segura con tu cuenta de Google para gestionar tus vehículos.
                </p>
                <button
                    onClick={handleGoogleSignIn}
                    className="google-button"
                    disabled={loading}
                >
                    <FaGoogle />
                    {loading ? 'Cargando...' : 'Continuar con Google'}
                </button>

                <p className="auth-footnote">
                    Al continuar, aceptas la gestión de seguridad y aprobación de acceso de la plataforma.
                </p>

                {import.meta.env.DEV && (
                    <form onSubmit={handleDevSignIn} className="dev-login">
                        <p className="dev-login__label">DEV LOGIN</p>
                        <input
                            type="email"
                            placeholder="Email"
                            value={devEmail}
                            onChange={(e) => setDevEmail(e.target.value)}
                            className="dev-login__input"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={devPassword}
                            onChange={(e) => setDevPassword(e.target.value)}
                            className="dev-login__input"
                            required
                        />
                        <button type="submit" className="dev-login__button" disabled={loading}>
                            {loading ? 'Cargando...' : 'Entrar'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
