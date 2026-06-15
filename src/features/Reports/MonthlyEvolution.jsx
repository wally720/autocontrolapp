// src/features/Reports/MonthlyEvolution.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currencyUtils.js'; // Reutilizamos la función de formato

const MonthlyEvolution = () => {
  const { expenses, loading } = useExpenses();

  // Procesar los datos para agruparlos por mes
  const data = expenses.reduce((acc, expense) => {
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

  if (loading) {
    return <p>Cargando datos del reporte...</p>;
  }

  if (expenses.length === 0) {
    return <p>No hay datos suficientes para este reporte.</p>;
  }

  return (
    <div>
      <h4>Evolución de Gastos Mensuales</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
          <XAxis dataKey="month" stroke="#e0e0e0" />
          <YAxis stroke="#e0e0e0" tickFormatter={value => new Intl.NumberFormat(undefined).format(value)} />
          <Tooltip
            contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
            itemStyle={{ color: '#e0e0e0' }}
            formatter={(value) => formatCurrency(value)}
          />
          <Legend wrapperStyle={{ color: '#e0e0e0' }} />
          <Bar dataKey="total" fill="#448aff" name="Total Gastado" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyEvolution;
