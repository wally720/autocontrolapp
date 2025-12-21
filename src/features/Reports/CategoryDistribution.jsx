// src/features/Reports/CategoryDistribution.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpenses } from '../../hooks/useExpenses';

// Paleta de colores para el gráfico de torta
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#db3434', '#8e44ad'];

const CategoryDistribution = () => {
  const { expenses, loading } = useExpenses();

  // Procesar los datos para agruparlos por categoría
  const data = expenses.reduce((acc, expense) => {
    const existingCategory = acc.find(item => item.name === expense.category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  if (loading) {
    return <p>Cargando datos del reporte...</p>;
  }

  if (expenses.length === 0) {
    return <p>No hay datos suficientes para este reporte.</p>;
  }

  return (
    <div>
      <h4>Distribución de Gastos por Categoría</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
            formatter={(value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)} 
          />
          <Legend wrapperStyle={{ color: '#e0e0e0' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDistribution;
