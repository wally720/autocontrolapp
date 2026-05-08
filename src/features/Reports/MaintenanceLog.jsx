// src/features/Reports/MaintenanceLog.jsx
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import './ReportTable.css';

const MaintenanceLog = () => {
  const { expenses, loading } = useExpenses();

  const maintenanceExpenses = expenses
    .filter(e => e.category === 'Mantenimiento' || e.category === 'Llantas')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) {
    return <p className="report-state">Cargando datos del reporte...</p>;
  }

  if (maintenanceExpenses.length === 0) {
    return <p className="report-state">No hay gastos de mantenimiento o llantas registrados.</p>;
  }

  return (
    <section className="report-panel">
      <h4>Bitácora de Mantenimiento y Llantas</h4>
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th className="report-table__amount-heading">Monto</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceExpenses.map(expense => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>{expense.category}</td>
                <td className="report-table__amount">{formatCurrency(expense.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MaintenanceLog;
