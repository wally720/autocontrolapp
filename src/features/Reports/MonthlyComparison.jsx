// src/features/Reports/MonthlyComparison.jsx
import React from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import './ComparisonCard.css';

const MonthlyComparison = () => {
  const { expenses, loading } = useExpenses();

  const calculateTotals = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let currentMonthTotal = 0;
    let previousMonthTotal = 0;

    expenses.forEach(expense => {
      const [year, month] = expense.date.split('-').map(Number);
      const expenseMonth = month - 1;
      const expenseYear = year;

      if (expenseYear === currentYear && expenseMonth === currentMonth) {
        currentMonthTotal += expense.amount;
      }
      if (expenseYear === previousMonthYear && expenseMonth === previousMonth) {
        previousMonthTotal += expense.amount;
      }
    });

    let percentageChange = 0;
    if (previousMonthTotal > 0) {
      percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      percentageChange = 100; // Si el mes anterior fue 0, cualquier gasto es un 100% de aumento
    }

    return { currentMonthTotal, previousMonthTotal, percentageChange };
  };

  const { currentMonthTotal, previousMonthTotal, percentageChange } = calculateTotals();

  const renderIcon = () => {
    if (percentageChange > 0) return <FaArrowUp className="icon-up" />;
    if (percentageChange < 0) return <FaArrowDown className="icon-down" />;
    return <FaEquals className="icon-equal" />;
  };

  if (loading) {
    return <p>Cargando datos del reporte...</p>;
  }

  return (
    <div>
      <h4>Comparativa Mes a Mes</h4>
      <div className="comparison-container">
        <div className="card">
          <span className="card-title">Mes Anterior</span>
          <span className="card-value">{formatCurrency(previousMonthTotal)}</span>
        </div>
        <div className="comparison-icon">
          {renderIcon()}
          <span className={`percentage ${percentageChange > 0 ? 'up' : 'down'}`}>
            {percentageChange.toFixed(1)}%
          </span>
        </div>
        <div className="card">
          <span className="card-title">Mes Actual</span>
          <span className="card-value">{formatCurrency(currentMonthTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyComparison;
