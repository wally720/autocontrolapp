// src/features/Reports/CategoryDistribution.jsx
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpenses } from '../../hooks/useExpenses';

// Paleta de colores para el gráfico de torta
const COLORS = ['#58a6ff', '#5eead4', '#f8c86b', '#ff9f6e', '#a78bfa', '#5ef0a3', '#7dd3fc', '#ff7a90', '#c084fc'];
const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(7, 11, 16, 0.96)',
  border: '1px solid rgba(94, 234, 212, 0.34)',
  borderRadius: '12px',
  color: '#edf6ff'
};

const CategoryDistribution = ({ expenses: filteredExpenses, loading: externalLoading } = {}) => {
  const { expenses, loading } = useExpenses();
  const reportExpenses = filteredExpenses || expenses;
  const isLoading = externalLoading ?? loading;

  // Procesar los datos para agruparlos por categoría de forma eficiente O(N)
  // Se utiliza useMemo para evitar cálculos innecesarios en cada renderizado
  const data = useMemo(() => {
    if (!reportExpenses || reportExpenses.length === 0) return [];

    return Array.from(
      reportExpenses.reduce((acc, expense) => {
        const { category, amount } = expense;
        const existing = acc.get(category);
        if (existing) {
          existing.value += amount;
        } else {
          acc.set(category, { name: category, value: amount });
        }
        return acc;
      }, new Map()).values()
    );
  }, [reportExpenses]);

  if (isLoading) {
    return <p className="report-state">Cargando datos del reporte...</p>;
  }

  if (data.length === 0) {
    return <p className="report-state">No hay gastos en el periodo seleccionado para distribuir por categoría.</p>;
  }

  return (
    <section className="report-panel">
      <h4>Distribución de Gastos por Categoría</h4>
      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={86}
              innerRadius={44}
              fill="#58a6ff"
              dataKey="value"
              nameKey="name"
              stroke="rgba(7, 11, 16, 0.78)"
              strokeWidth={2}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: '#edf6ff' }}
              labelStyle={{ color: '#7dd3fc', fontWeight: 800 }}
              formatter={(value) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(value)}
            />
            <Legend wrapperStyle={{ color: '#a9b7c8', paddingTop: '0.5rem' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default CategoryDistribution;
