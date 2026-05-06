// src/components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaChartPie, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import VehicleSwitcher from '../features/VehicleSwitcher';
import { APP_VERSION } from '../utils/constants';

import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNotification } from '../context/NotificationContext';
import './Navbar.css';

const Navbar = () => {
  const { userProfile, currentUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showNotification('No se pudo cerrar sesión. Intentá de nuevo.', 'error');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="AutoGasto Pro Logo"
          className="navbar-logo-placeholder"
        />
        <span className="navbar-title">Auto Gasto PRO</span>
        <span className="navbar-version">v{APP_VERSION}</span>
      </div>

      {currentUser && userProfile?.status === 'approved' && (
        <>
          <div className="navbar-links">
            <NavLink to="/">
              <FaTachometerAlt />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/reports">
              <FaChartPie />
              <span>Reportes</span>
            </NavLink>
            {userProfile?.role === 'admin' && (
              <NavLink to="/admin">
                <FaUserShield />
                <span>Admin</span>
              </NavLink>
            )}
          </div>
          <div className="navbar-controls">
            <VehicleSwitcher />
            <div className="user-profile-nav">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Perfil"
                  referrerPolicy="no-referrer"
                  className="user-profile-avatar"
                />
              ) : (
                <span className="user-profile-email">{currentUser.email}</span>
              )}
              <button onClick={handleLogout} className="logout-btn" type="button">
                <FaSignOutAlt />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
