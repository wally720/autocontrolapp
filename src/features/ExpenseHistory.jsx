// src/features/ExpenseHistory.jsx
import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import {
  FaGasPump, FaWrench, FaFileContract, FaUniversity, FaShower,
  FaParking, FaRoad, FaDotCircle, FaQuestionCircle, FaStickyNote, FaTrash
} from 'react-icons/fa';
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

const ExpenseHistory = () => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const [currentPage, setCurrentPage] = useState(1);
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
    if (window.confirm(`¿Estás seguro de que quieres eliminar el gasto de ${formattedAmount}?`)) {
      deleteExpense(id);
    }
  };

  if (loading) return <div className="loading">Cargando historial...</div>;

  if (expenses.length === 0) return <div className="no-expenses">No hay gastos registrados para este vehículo.</div>;

  return (
    <div className="history-container">
      <h3>Historial de Gastos</h3>
      <div className="table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Categoría y Detalles</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Monto</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map(expense => (
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
                <td className="amount" style={{ textAlign: 'right' }}>{formatCurrency(expense.amount)}</td>
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

