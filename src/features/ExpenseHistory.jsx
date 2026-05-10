// src/features/ExpenseHistory.jsx
/* eslint-disable react-refresh/only-export-components -- formatCurrency ya es API compartida por reportes y dashboard. */
import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import {
  FaStickyNote, FaTrash, FaQuestionCircle
} from 'react-icons/fa';
import { categoryIcons } from '../utils/categoryIcons';
import { CATEGORY_FUEL } from '../utils/constants';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { useNotification } from '../context/NotificationContext';
import './ExpenseHistory.css';

export const formatCurrency = (value) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

const ExpenseHistory = () => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const recordsPerPage = 10;

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentRecords = expenses.slice(firstIndex, lastIndex);
  const nPages = Math.ceil(expenses.length / recordsPerPage);

  const prevPage = () => {
    if (currentPage !== 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = () => {
    if (currentPage !== nPages) setCurrentPage(currentPage + 1);
  };

  const handleDelete = (id, amount) => {
    const formattedAmount = formatCurrency(amount);
    setPendingDelete({ id, formattedAmount });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    const deleted = await deleteExpense(pendingDelete.id);

    if (deleted) {
      showNotification(`Gasto de ${pendingDelete.formattedAmount} eliminado correctamente.`, 'success');
    }

    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  if (loading) return <div className="loading">Cargando historial...</div>;

  if (expenses.length === 0) return <div className="no-expenses">No hay gastos registrados para este vehículo.</div>;

  return (
    <div className="history-container">
      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Eliminar gasto"
        message={pendingDelete ? `¿Estás seguro de que querés eliminar el gasto de ${pendingDelete.formattedAmount}?` : ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <div className="history-header">
        <div>
          <span className="history-kicker">Ledger vehicular</span>
          <h3>Historial de Gastos</h3>
        </div>
        <span className="history-count">{expenses.length} registros</span>
      </div>
      <div className="table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Categoría y Detalles</th>
              <th>Fecha</th>
              <th className="amount-heading">Monto</th>
              <th className="actions-heading">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map(expense => (
              <tr key={expense.id}>
                <td className="category-cell">
                  <div className="category-main category-badge">
                    <span className="category-icon" aria-hidden="true">{categoryIcons[expense.category] || <FaQuestionCircle />}</span>
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
                <td className="date-cell">{expense.date}</td>
                <td className="amount">{formatCurrency(expense.amount)}</td>
                <td className="actions-cell">
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(expense.id, expense.amount)}
                    title="Eliminar gasto"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nPages > 1 && (
        <div className="pagination">
          <button onClick={prevPage} disabled={currentPage === 1}>Anterior</button>
          <span>Página {currentPage} de {nPages}</span>
          <button onClick={nextPage} disabled={currentPage === nPages}>Siguiente</button>
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory;

