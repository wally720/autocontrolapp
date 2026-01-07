// src/components/DashboardHeader.jsx
import React from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../features/ExpenseHistory';
import { FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import './DashboardHeader.css';

const DashboardHeader = () => {
  const { expenses, loading } = useExpenses();

  const currentMonthName = new Date().toLocaleString(undefined, { month: 'long' });

  const monthlyTotal = expenses.reduce((total, expense) => {
    const expenseMonth = new Date(expense.date).getMonth();
    const currentMonth = new Date().getMonth();
    if (expenseMonth === currentMonth) {
      return total + expense.amount;
    }
    return total;
  }, 0);

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
