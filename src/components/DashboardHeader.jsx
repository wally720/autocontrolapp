// src/components/DashboardHeader.jsx
import { useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../features/ExpenseHistory';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaChartLine, FaChevronRight, FaDollarSign } from 'react-icons/fa';
import './DashboardHeader.css';

const DashboardHeader = () => {
  const { expenses, loading } = useExpenses();

  const currentMonthName = new Date().toLocaleString(undefined, { month: 'long' });

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
  const anioAnterior = mesActual === 0 ? anioActual - 1 : anioActual;

  const { monthlyTotal, prevMonthlyTotal } = useMemo(() => {
    let current = 0;
    let previous = 0;
    
    expenses.forEach((expense) => {
      // Dividimos la fecha "AAAA-MM-DD" manualmente para evitar desfases de zona horaria
      const [anio, mes] = expense.date.split('-').map(Number);
      
      // mes - 1 porque en JavaScript los meses van de 0 a 11
      if (anio === anioActual && (mes - 1) === mesActual) {
        current += expense.amount;
      } else if (anio === anioAnterior && (mes - 1) === mesAnterior) {
        previous += expense.amount;
      }
    });
    
    return { monthlyTotal: current, prevMonthlyTotal: previous };
  }, [expenses, mesActual, anioActual, mesAnterior, anioAnterior]);

  return (
    <section className="dashboard-header" aria-labelledby="dashboard-header-title">
      <div className="header-left">
        <p className="header-eyebrow">Panel operativo</p>
        <h2 id="dashboard-header-title" className="header-title">Resumen Mensual</h2>
        <div className="header-subtitle">
          <FaCalendarAlt aria-hidden="true" />
          <span>{currentMonthName}</span>
        </div>
      </div>
      <div className="header-right">
        <div className="total-panel">
          <div className="total-label">
            <FaDollarSign aria-hidden="true" />
            <span>Total gastado este mes</span>
          </div>
          <div className="total-amount" aria-live="polite">
            {loading ? 'Calculando...' : formatCurrency(monthlyTotal)}
          </div>
        </div>
        <Link to="/reports?report=detail" className="prev-month-container prev-month-link" aria-label="Ver detalle de reportes del mes anterior">
          <span className="prev-month-icon" aria-hidden="true"><FaChartLine /></span>
          <span className="prev-month-label">Mes anterior</span>
          <span className="prev-month-amount">{loading ? '...' : formatCurrency(prevMonthlyTotal)}</span>
          <FaChevronRight className="prev-month-arrow" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};

export default DashboardHeader;
