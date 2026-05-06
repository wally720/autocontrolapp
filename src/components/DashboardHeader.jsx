// src/components/DashboardHeader.jsx
import { useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../features/ExpenseHistory';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
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
    <div className="dashboard-header">
      <div className="header-left">
        <h2 className="header-title">Resumen Mensual</h2>
        <div className="header-subtitle">
          <FaCalendarAlt />
          <span>{currentMonthName}</span>
        </div>
      </div>
      <div className="header-right">
        <div className="total-label">
          <FaDollarSign />
          <span>Total Gastado este Mes</span>
        </div>
        <div className="total-amount">
          {loading ? 'Calculando...' : formatCurrency(monthlyTotal)}
        </div>
        <Link to="/reports?report=detail" className="prev-month-container prev-month-link">
          <span className="prev-month-label">Mes anterior:</span>
          <span className="prev-month-amount">{loading ? '...' : formatCurrency(prevMonthlyTotal)}</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
