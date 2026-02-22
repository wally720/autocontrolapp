import React, { useState, useEffect, useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import { getLocalDate, parseLocalDate } from '../../utils/dateUtils';
import {
  FaQuestionCircle, FaStickyNote,
  FaUndo, FaCalendarAlt
} from 'react-icons/fa';
import { categoryIcons } from '../../utils/categoryIcons';
import { CATEGORY_FUEL } from '../../utils/constants';
import './ExpenseDetail.css';

const categoryIcons = {
  'Combustible': <FaGasPump />,
  'Mantenimiento': <FaWrench />,
  'Seguros/Papeles': <FaFileContract />,
  'Impuestos': <FaUniversity />,
  'Lavado': <FaShower />,
  'Parqueadero': <FaParking />,
  'Peajes': <FaRoad />,
  'Llantas': <FaDotCircle />,
  'Otros': <FaQuestionCircle />,
};

const ExpenseDetail = () => {
  const { expenses, loading } = useExpenses();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to set default dates (Previous Month)
  const setPreviousMonth = () => {
    const today = new Date();
    // Previous month: current month index - 1.
    // Example: Feb (1) -> Jan (0). Jan (0) -> Dec (-1, handles year automatically)
    const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    setStartDate(getLocalDate(firstDayPrevMonth));
    setEndDate(getLocalDate(lastDayPrevMonth));
  };

  // Function to set Last 3 Months (90 days)
  const setLast3Months = () => {
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    // Enforce min date of 2024-01-01
    const minDate = new Date(2024, 0, 1);
    const effectiveStartDate = ninetyDaysAgo < minDate ? minDate : ninetyDaysAgo;

    setStartDate(getLocalDate(effectiveStartDate));
    setEndDate(getLocalDate(today));
  };

  // Set default dates on mount
  useEffect(() => {
    setPreviousMonth();
  }, []);

  const handleDateChange = (type, value) => {
    // If user clears the input
    if (!value) {
      if (type === 'start') setStartDate('');
      else setEndDate('');
      return;
    }

    const newDate = parseLocalDate(value);
    const minDate = new Date(2024, 0, 1); // Jan 1, 2024 Local

    if (newDate < minDate) {
      alert('La fecha no puede ser anterior al 2024.');
      return; // Do not update state
    }

    // Determine hypothetical start and end
    const nextStartStr = type === 'start' ? value : startDate;
    const nextEndStr = type === 'end' ? value : endDate;

    // Only validate range if both are present
    if (nextStartStr && nextEndStr) {
      const start = parseLocalDate(nextStartStr);
      const end = parseLocalDate(nextEndStr);

      // Validate date order
      if (start > end) {
        alert('La fecha de inicio no puede ser mayor que la fecha final.');
        return;
      }

      // Validate 90 days range
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 90) {
        alert('El rango de fechas no puede exceder los 90 días.');
        return;
      }
    }

    if (type === 'start') setStartDate(value);
    else setEndDate(value);
  };

  // Memoize filtered expenses and total amount
  const { filteredExpenses, totalAmount } = useMemo(() => {
    if (!startDate || !endDate) {
      return { filteredExpenses: [], totalAmount: 0 };
    }

    // Filter expenses based on date string comparison (YYYY-MM-DD works lexicographically)
    const filtered = expenses.filter(expense => {
      return expense.date >= startDate && expense.date <= endDate;
    });

    // Sort by date descending
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    const total = filtered.reduce((sum, item) => sum + item.amount, 0);

    return { filteredExpenses: filtered, totalAmount: total };
  }, [expenses, startDate, endDate]);

  if (loading) return <div className="loading">Cargando reporte...</div>;

  return (
    <div className="expense-detail-container">
      <div className="summary-section">
        <div className="date-filters">
          <div className="date-input-group">
            <label htmlFor="startDate">Desde:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              min="2024-01-01"
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="endDate">Hasta:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              min="2024-01-01"
            />
          </div>

          <div className="filter-actions">
            <button className="filter-btn reset" onClick={setPreviousMonth} title="Volver al mes anterior">
                <FaUndo /> Reset
            </button>
            <button className="filter-btn range-3m" onClick={setLast3Months} title="Últimos 90 días">
                <FaCalendarAlt /> 3 Meses
            </button>
          </div>
        </div>

        <div className="summary-total">
          <span>Total en periodo:</span>
          {formatCurrency(totalAmount)}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="expense-detail-table">
          <thead>
            <tr>
              <th>Categoría y Detalles</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                <tr key={expense.id}>
                  <td className="category-cell">
                    <div className="category-main">
                      {categoryIcons[expense.category] || <FaQuestionCircle />}
                      <span>{expense.category}</span>
                    </div>
                    {expense.category === CATEGORY_FUEL && expense.odometer && (
                      <div className="fuel-details">
                        <span>{expense.odometer.toLocaleString()} km</span>
                        <span>{expense.gallons ? expense.gallons.toFixed(2) + ' Gal' : ''}</span>
                      </div>
                    )}
                    {expense.notes && (
                      <div className="notes-detail" title={expense.notes}>
                        <FaStickyNote />
                        <span>
                          {expense.notes.length > 30
                            ? `${expense.notes.substring(0, 30)}...`
                            : expense.notes}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>{expense.date}</td>
                  <td className="amount">{formatCurrency(expense.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">No se encontraron gastos en el rango seleccionado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseDetail;
