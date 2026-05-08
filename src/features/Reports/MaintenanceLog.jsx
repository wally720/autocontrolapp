// src/features/Reports/MaintenanceLog.jsx
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import { CATEGORY_MAINTENANCE, CATEGORY_TIRES } from '../../utils/constants';
import './ReportTable.css';

const MAINTENANCE_CATEGORIES = [CATEGORY_MAINTENANCE, CATEGORY_TIRES];

const formatMaintenanceDate = (expense) => expense?.date || 'Sin fecha';

const MaintenanceLog = ({ expenses: filteredExpenses, loading: externalLoading } = {}) => {
  const { expenses, loading } = useExpenses();
  const reportExpenses = filteredExpenses || expenses;
  const isLoading = externalLoading ?? loading;

  const maintenanceExpenses = reportExpenses
    .filter(e => MAINTENANCE_CATEGORIES.includes(e.category))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalSpent = maintenanceExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const lastMaintenance = maintenanceExpenses.find(expense => expense.category === CATEGORY_MAINTENANCE);
  const lastTires = maintenanceExpenses.find(expense => expense.category === CATEGORY_TIRES);
  const latestOdometer = maintenanceExpenses
    .map(expense => Number(expense.odometer))
    .filter(value => Number.isFinite(value) && value > 0)
    .sort((a, b) => b - a)[0];

  if (isLoading) {
    return <p className="report-state">Cargando datos del reporte...</p>;
  }

  if (maintenanceExpenses.length === 0) {
    return <p className="report-state">No hay gastos de mantenimiento o llantas dentro del periodo seleccionado. Cambiá el filtro global para revisar más historial.</p>;
  }

  return (
    <section className="report-panel">
      <h4>Bitácora de Mantenimiento y Llantas</h4>
      <div className="maintenance-summary-grid" aria-label="Resumen de mantenimiento del periodo">
        <article className="maintenance-summary-card">
          <span>Eventos</span>
          <strong>{maintenanceExpenses.length}</strong>
        </article>
        <article className="maintenance-summary-card">
          <span>Total gastado</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </article>
        <article className="maintenance-summary-card">
          <span>Último mantenimiento</span>
          <strong>{formatMaintenanceDate(lastMaintenance)}</strong>
        </article>
        <article className="maintenance-summary-card">
          <span>Últimas llantas</span>
          <strong>{formatMaintenanceDate(lastTires)}</strong>
        </article>
        <article className="maintenance-summary-card">
          <span>Odómetro más reciente</span>
          <strong>{latestOdometer ? `${latestOdometer.toLocaleString()} km` : 'No registrado'}</strong>
        </article>
      </div>
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Odómetro</th>
              <th className="report-table__amount-heading">Monto</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceExpenses.map(expense => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>{expense.category}</td>
                <td>{expense.odometer ? `${Number(expense.odometer).toLocaleString()} km` : '—'}</td>
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
