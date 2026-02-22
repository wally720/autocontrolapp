// src/components/DashboardHeader.jsx
import React, { useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../features/ExpenseHistory';
import { FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import './DashboardHeader.css';

const DashboardHeader = () => {
  const { expenses, loading } = useExpenses();

  const currentMonthName = new Date().toLocaleString(undefined, { month: 'long' });

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const monthlyTotal = useMemo(() => {
    return expenses.reduce((total, expense) => {
      // Dividimos la fecha "AAAA-MM-DD" manualmente para evitar desfases de zona horaria
      const [anio, mes] = expense.date.split('-').map(Number);

      // mes - 1 porque en JavaScript los meses van de 0 a 11
      if (anio === anioActual && (mes - 1) === mesActual) {
        return total + expense.amount;
      }
      return total;
    }, 0);
  }, [expenses, mesActual, anioActual]);

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <h2 className="header-title">Resumen Mensual</h2>
        <div className="header-subtitle">
          <FaCalendarAlt />
          <span>{currentMonthName}</span>
        </div>
      </div>
      <div className="header-right">
        <div className="total-label">
          <FaDollarSign />
          <span>Total Gastado este Mes</span>
        </div>
        <div className="total-amount">
          {loading ? 'Calculando...' : formatCurrency(monthlyTotal)}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
