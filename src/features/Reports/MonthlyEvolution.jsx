// src/features/Reports/MonthlyEvolution.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory'; // Reutilizamos la función de formato

const CHART_THEME = {
  grid: 'rgba(135, 166, 199, 0.18)',
  axis: '#a9b7c8',
  tooltipBg: 'rgba(7, 11, 16, 0.96)',
  tooltipBorder: 'rgba(94, 234, 212, 0.34)',
  primary: '#58a6ff'
};

const MonthlyEvolution = ({ expenses: filteredExpenses, loading: externalLoading } = {}) => {
  const { expenses, loading } = useExpenses();
  const reportExpenses = filteredExpenses || expenses;
  const isLoading = externalLoading ?? loading;

  // Procesar los datos para agruparlos por mes
  const data = reportExpenses.reduce((acc, expense) => {
    // Parseamos la fecha manualmente y creamos un objeto Date local para obtener el nombre del mes
    const [year, monthNum] = expense.date.split('-').map(Number);
    const dateObj = new Date(year, monthNum - 1, 1);
    const month = dateObj.toLocaleString(undefined, { month: 'short', year: '2-digit' });
    const existingMonth = acc.find(item => item.month === month);

    if (existingMonth) {
      existingMonth.total += expense.amount;
    } else {
      acc.push({ month, total: expense.amount });
    }

    return acc;
  }, []).reverse(); // Revertir para mostrar los meses más recientes primero

  if (isLoading) {
    return <p className="report-state">Cargando datos del reporte...</p>;
  }

  if (reportExpenses.length === 0) {
    return <p className="report-state">No hay gastos dentro del periodo seleccionado para construir la evolución mensual.</p>;
  }

  return (
    <section className="report-panel">
      <h4>Evolución de Gastos Mensuales</h4>
      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 8" stroke={CHART_THEME.grid} vertical={false} />
            <XAxis dataKey="month" stroke={CHART_THEME.axis} tickLine={false} axisLine={false} />
            <YAxis stroke={CHART_THEME.axis} tickLine={false} axisLine={false} tickFormatter={value => new Intl.NumberFormat(undefined).format(value)} />
            <Tooltip
              cursor={{ fill: 'rgba(88, 166, 255, 0.08)' }}
              contentStyle={{ backgroundColor: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: '12px', color: '#edf6ff' }}
              labelStyle={{ color: '#7dd3fc', fontWeight: 800 }}
              itemStyle={{ color: '#edf6ff' }}
              formatter={(value) => formatCurrency(value)}
            />
            <Legend wrapperStyle={{ color: CHART_THEME.axis, paddingTop: '0.5rem' }} />
            <Bar dataKey="total" fill={CHART_THEME.primary} radius={[10, 10, 3, 3]} name="Total Gastado" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default MonthlyEvolution;
