// src/features/Reports/MonthlyComparison.jsx
import React, { useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import { getLocalDate } from '../../utils/dateUtils';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import './ComparisonCard.css';

const MonthlyComparison = () => {
  const { expenses, loading } = useExpenses();

  const { currentMonthTotal, previousMonthTotal, percentageChange } = useMemo(() => {
    // Usamos getLocalDate para obtener la fecha de hoy, evitando problemas de timezone.
    const todayStr = getLocalDate();
    const currentYear = parseInt(todayStr.substring(0, 4), 10);
    const currentMonth = parseInt(todayStr.substring(5, 7), 10); // 1-12

    let previousMonth = currentMonth - 1;
    let previousMonthYear = currentYear;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousMonthYear = currentYear - 1;
    }

    const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}-`;
    const previousMonthPrefix = `${previousMonthYear}-${String(previousMonth).padStart(2, '0')}-`;

    let currentMonthTotal = 0;
    let previousMonthTotal = 0;

    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      if (expense.date.startsWith(currentMonthPrefix)) {
        currentMonthTotal += expense.amount;
      } else if (expense.date.startsWith(previousMonthPrefix)) {
        previousMonthTotal += expense.amount;
      }
    }

    let percentageChange = 0;
    if (previousMonthTotal > 0) {
      percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      percentageChange = 100; // Si el mes anterior fue 0, cualquier gasto es un 100% de aumento
    }

    return { currentMonthTotal, previousMonthTotal, percentageChange };
  }, [expenses]);

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
