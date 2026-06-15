// src/features/Reports/AverageByCategory.jsx
import React from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currencyUtils.js';
import './ReportTable.css';

const AverageByCategory = () => {
  const { expenses, loading } = useExpenses();

  const calculateAverages = () => {
    if (expenses.length === 0) return [];

    const categoryCounts = {};
    const categoryTotals = {};

    expenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
        categoryCounts[expense.category] += 1;
      } else {
        categoryTotals[expense.category] = expense.amount;
        categoryCounts[expense.category] = 1;
      }
    });

    return Object.keys(categoryTotals).map(category => ({
      category,
      average: categoryTotals[category] / categoryCounts[category],
      count: categoryCounts[category]
    })).sort((a, b) => b.average - a.average);
  };

  const averageData = calculateAverages();

  if (loading) {
    return <p>Cargando datos del reporte...</p>;
  }

  if (averageData.length === 0) {
    return <p>No hay datos suficientes para este reporte.</p>;
  }

  return (
    <div>
      <h4>Gasto Promedio por Visita (por Categoría)</h4>
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Número de Registros</th>
              <th style={{ textAlign: 'right' }}>Gasto Promedio</th>
            </tr>
          </thead>
          <tbody>
            {averageData.map(({ category, average, count }) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{count}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(average)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AverageByCategory;
