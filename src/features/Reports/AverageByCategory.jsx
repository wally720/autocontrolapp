// src/features/Reports/AverageByCategory.jsx
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import './ReportTable.css';

const AverageByCategory = ({ expenses: filteredExpenses, loading: externalLoading } = {}) => {
  const { expenses, loading } = useExpenses();
  const reportExpenses = filteredExpenses || expenses;
  const isLoading = externalLoading ?? loading;

  const calculateAverages = () => {
    if (reportExpenses.length === 0) return [];

    const categoryCounts = {};
    const categoryTotals = {};

    reportExpenses.forEach(expense => {
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

  if (isLoading) {
    return <p className="report-state">Cargando datos del reporte...</p>;
  }

  if (averageData.length === 0) {
    return <p className="report-state">No hay gastos en el periodo seleccionado para calcular promedios por categoría.</p>;
  }

  return (
    <section className="report-panel">
      <h4>Gasto Promedio por Visita (por Categoría)</h4>
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Número de Registros</th>
              <th className="report-table__amount-heading">Gasto Promedio</th>
            </tr>
          </thead>
          <tbody>
            {averageData.map(({ category, average, count }) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{count}</td>
                <td className="report-table__amount">{formatCurrency(average)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AverageByCategory;
