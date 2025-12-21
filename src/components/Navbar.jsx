// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaChartPie } from 'react-icons/fa';
import VehicleSwitcher from '../features/VehicleSwitcher';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img 
          src="/logo.png" 
          alt="AutoGasto Pro Logo" 
          className="navbar-logo-placeholder" 
        />
      </div>
      <div className="navbar-links">
        <NavLink to="/">
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/reports">
          <FaChartPie />
          <span>Reportes</span>
        </NavLink>
      </div>
      <VehicleSwitcher />
    </nav>
  );
};

export default Navbar;
