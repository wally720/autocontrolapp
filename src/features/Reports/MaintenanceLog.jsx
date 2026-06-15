// src/features/Reports/MaintenanceLog.jsx
import React from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currencyUtils.js';

const MaintenanceLog = () => {
  const { expenses, loading } = useExpenses();

  const maintenanceExpenses = expenses
    .filter(e => e.category === 'Mantenimiento' || e.category === 'Llantas')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) {
    return <p>Cargando datos del reporte...</p>;
  }

  if (maintenanceExpenses.length === 0) {
    return <p>No hay gastos de mantenimiento o llantas registrados.</p>;
  }

  return (
    <div>
      <h4>Bitácora de Mantenimiento y Llantas</h4>
      <table className="expenses-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Categoría</th>
            <th style={{ textAlign: 'right' }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {maintenanceExpenses.map(expense => (
            <tr key={expense.id}>
              <td>{expense.date}</td>
              <td>{expense.category}</td>
              <td className="amount" style={{ textAlign: 'right' }}>{formatCurrency(expense.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceLog;
