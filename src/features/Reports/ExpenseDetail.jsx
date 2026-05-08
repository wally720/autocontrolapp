import { useState, useEffect, useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import { getLocalDate, parseLocalDate } from '../../utils/dateUtils';
import {
  FaQuestionCircle, FaStickyNote,
  FaUndo, FaCalendarAlt
} from 'react-icons/fa';
import { categoryIcons } from '../../utils/categoryIcons';
import { CATEGORY_FUEL } from '../../utils/constants';
import { useNotification } from '../../context/NotificationContext';
import './ExpenseDetail.css';

const getPreviousMonthRange = () => {
  const today = new Date();
  const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
    startDate: getLocalDate(firstDayPrevMonth),
    endDate: getLocalDate(lastDayPrevMonth)
  };
};

const getLast3MonthsRange = () => {
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const minDate = new Date(2024, 0, 1);
  const effectiveStartDate = ninetyDaysAgo < minDate ? minDate : ninetyDaysAgo;

  return {
    startDate: getLocalDate(effectiveStartDate),
    endDate: getLocalDate(today)
  };
};

const ExpenseDetail = ({ expenses: controlledExpenses, loading: externalLoading, globalRange } = {}) => {
  const { expenses, loading } = useExpenses();
  const reportExpenses = controlledExpenses || expenses;
  const isLoading = externalLoading ?? loading;
  const { showNotification } = useNotification();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const setPreviousMonth = () => {
    const range = getPreviousMonthRange();

    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const setLast3Months = () => {
    const range = getLast3MonthsRange();

    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  // Set default dates on mount
  useEffect(() => {
    if (globalRange?.startDate && globalRange?.endDate) {
      setStartDate(globalRange.startDate);
      setEndDate(globalRange.endDate);
      return;
    }

    const range = getPreviousMonthRange();
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [globalRange]);

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
      showNotification('La fecha no puede ser anterior al 2024.', 'error');
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
        showNotification('La fecha de inicio no puede ser mayor que la fecha final.', 'error');
        return;
      }

      // Validate 90 days range
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 90) {
        showNotification('El rango de fechas no puede exceder los 90 días.', 'error');
        return;
      }
    }

    if (type === 'start') setStartDate(value);
    else setEndDate(value);
  };

  const expensesInPeriod = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }

    // Filter expenses based on date string comparison (YYYY-MM-DD works lexicographically)
    return reportExpenses.filter(expense => {
      return expense.date >= startDate && expense.date <= endDate;
    });
  }, [reportExpenses, startDate, endDate]);

  const categoryOptions = useMemo(() => {
    return [...new Set(expensesInPeriod
      .map(expense => expense.category)
      .filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }, [expensesInPeriod]);

  useEffect(() => {
    if (selectedCategory !== 'all' && !categoryOptions.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categoryOptions, selectedCategory]);

  // Memoize filtered expenses and total amount
  const { filteredExpenses, totalAmount } = useMemo(() => {
    const filtered = expensesInPeriod.filter(expense => {
      return selectedCategory === 'all' || expense.category === selectedCategory;
    });

    // Sort by date descending
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    const total = filtered.reduce((sum, item) => sum + item.amount, 0);

    return { filteredExpenses: filtered, totalAmount: total };
  }, [expensesInPeriod, selectedCategory]);

  if (isLoading) return <div className="loading">Cargando reporte...</div>;

  return (
    <div className="expense-detail-container">
      <div className="expense-detail-heading">
        <div>
          <span className="detail-kicker">Detalle filtrado</span>
          <h4>Movimientos del periodo</h4>
        </div>
        <div className="detail-count" aria-label="Cantidad de gastos filtrados">
          <strong>{filteredExpenses.length}</strong>
          <span>registros</span>
        </div>
      </div>

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
          <div className="date-input-group category-input-group">
            <label htmlFor="categoryFilter">Categoría:</label>
            <select
              id="categoryFilter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
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

      <div className="active-filter-chip" aria-live="polite">
        Periodo global aplicado. Categoría activa: <strong>{selectedCategory === 'all' ? 'Todas' : selectedCategory}</strong>
      </div>

      <div className="table-wrapper">
        <table className="expense-detail-table">
          <thead>
            <tr>
              <th>Categoría y Detalles</th>
              <th>Fecha</th>
              <th className="amount-heading">Monto</th>
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
                <td colSpan="3" className="no-data">No se encontraron gastos para el periodo y categoría seleccionados. Probá ampliar el filtro global o elegir otra categoría.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseDetail;
