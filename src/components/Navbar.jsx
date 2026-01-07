// src/components/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaChartPie, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import VehicleSwitcher from '../features/VehicleSwitcher';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
        <span style={{ color: 'white', fontWeight: 'bold', marginLeft: '10px' }}>Auto Gasto PRO</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <VehicleSwitcher />
            <div className="user-profile-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '15px' }}>
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #448aff', objectFit: 'cover' }}
                />

              ) : (
                <span style={{ fontSize: '0.85rem', opacity: '0.9' }}>{currentUser.email}</span>
              )}
              <button onClick={handleLogout} className="logout-btn" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '4px' }}>
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
