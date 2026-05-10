import { useState, useEffect, useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import {
  FaQuestionCircle, FaStickyNote
} from 'react-icons/fa';
import { categoryIcons } from '../../utils/categoryIcons';
import { CATEGORY_FUEL } from '../../utils/constants';
import './ExpenseDetail.css';

const ExpenseDetail = ({ expenses: controlledExpenses, loading: externalLoading, globalRange } = {}) => {
  const { expenses, loading } = useExpenses();
  const reportExpenses = controlledExpenses || expenses;
  const isLoading = externalLoading ?? loading;
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categoryOptions = useMemo(() => {
    return [...new Set(reportExpenses
      .map(expense => expense.category)
      .filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }, [reportExpenses]);

  useEffect(() => {
    if (selectedCategory !== 'all' && !categoryOptions.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categoryOptions, selectedCategory]);

  // Memoize filtered expenses and total amount
  const { filteredExpenses, totalAmount } = useMemo(() => {
    const filtered = reportExpenses.filter(expense => {
      return selectedCategory === 'all' || expense.category === selectedCategory;
    });

    // Sort by date descending
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    const total = filtered.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return { filteredExpenses: filtered, totalAmount: total };
  }, [reportExpenses, selectedCategory]);

  const globalRangeLabel = globalRange?.startDate && globalRange?.endDate
    ? `${globalRange.startDate} → ${globalRange.endDate}`
    : 'periodo global activo';

  if (isLoading) return <div className="loading">Cargando reporte...</div>;

  return (
    <div className="expense-detail-container">
      <div className="expense-detail-heading">
        <div>
          <span className="detail-kicker">Detalle filtrado</span>
          <h4>Movimientos del periodo global</h4>
        </div>
        <div className="detail-count" aria-label="Cantidad de gastos filtrados">
          <strong>{filteredExpenses.length}</strong>
          <span>registros</span>
        </div>
      </div>

      <div className="summary-section">
        <div className="detail-filters">
          <div className="detail-input-group category-input-group">
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
        </div>

        <div className="summary-total">
          <span>Total del periodo global:</span>
          {formatCurrency(totalAmount)}
        </div>
      </div>

      <div className="active-filter-chip" aria-live="polite">
        Periodo global aplicado: <strong>{globalRangeLabel}</strong>. Categoría activa: <strong>{selectedCategory === 'all' ? 'Todas' : selectedCategory}</strong>
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
