// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaCar } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

const Login = () => {
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
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

    return (
        <div className="auth-container">
            <div className="auth-form" style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="auth-logo" style={{ marginBottom: '2rem' }}>
                    <FaCar style={{ fontSize: '3rem', color: '#2563eb' }} />
                    <h1 style={{ marginTop: '1rem', color: '#1e293b' }}>Auto Gasto PRO</h1>
                </div>

                <h2>Bienvenido</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                    Inicia sesión de forma segura con tu cuenta de Google para gestionar tus vehículos.
                </p>
                <button
                    onClick={handleGoogleSignIn}
                    className="google-button"
                    disabled={loading}
                >
                    <FaGoogle style={{ marginRight: '10px' }} />
                    {loading ? 'Cargando...' : 'Continuar con Google'}
                </button>

                <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Al continuar, aceptas la gestión de seguridad y aprobación de acceso de la plataforma.
                </p>
            </div>
        </div>
    );
};

export default Login;
