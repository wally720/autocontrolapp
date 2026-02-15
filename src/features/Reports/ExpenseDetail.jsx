import React, { useState, useEffect, useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import {
  FaGasPump, FaWrench, FaFileContract, FaUniversity, FaShower,
  FaParking, FaRoad, FaDotCircle, FaQuestionCircle, FaStickyNote
} from 'react-icons/fa';
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

// Helper to parse "YYYY-MM-DD" to Local Date object
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const ExpenseDetail = () => {
  const { expenses, loading } = useExpenses();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Set default dates to previous month on mount
  useEffect(() => {
    const today = new Date();
    // Previous month: current month index - 1.
    // Example: Feb (1) -> Jan (0). Jan (0) -> Dec (-1, handles year automatically)
    const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    setStartDate(formatDate(firstDayPrevMonth));
    setEndDate(formatDate(lastDayPrevMonth));
  }, []);

  const handleDateChange = (type, value) => {
    // If user clears the input
    if (!value) {
      if (type === 'start') setStartDate('');
      else setEndDate('');
      return;
    }

    const newDate = parseDate(value);
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
      const start = parseDate(nextStartStr);
      const end = parseDate(nextEndStr);

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
                    {expense.category === 'Combustible' && expense.odometer && (
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
