// src/features/Reports/MonthlyEvolution.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory'; // Reutilizamos la función de formato

const CHART_THEME = {
  grid: 'rgba(135, 166, 199, 0.18)',
  axis: '#a9b7c8',
  tooltipBg: 'rgba(7, 11, 16, 0.96)',
  tooltipBorder: 'rgba(94, 234, 212, 0.34)'
};

const COMPACT_VALUE_LIMITS = {
  millionMinimum: 999_500,
  millionDivisor: 1_000_000,
  thousandMinimum: 1_000,
  thousandDivisor: 1_000
};

const BAR_LABEL_LAYOUT = {
  minBarWidth: 44,
  estimatedCharacterWidth: 8,
  horizontalPadding: 16,
  minPillWidth: 44,
  height: 22,
  radius: 11,
  verticalOffset: 30,
  topInset: 2
};

const MONTHLY_CHART_LAYOUT = {
  margin: { top: 42, right: 16, left: 2, bottom: 8 },
  yAxisWidth: 56,
  tickMargin: 8,
  barCategoryGap: '6%',
  barGap: 2,
  maxBarSize: 68
};

const formatCompactChartValue = (value) => {
  const numericValue = Number(value) || 0;
  const absoluteValue = Math.abs(numericValue);

  if (absoluteValue >= COMPACT_VALUE_LIMITS.millionMinimum) {
    return `${formatScaledValue(numericValue / COMPACT_VALUE_LIMITS.millionDivisor)}M`;
  }

  if (absoluteValue >= COMPACT_VALUE_LIMITS.thousandMinimum) {
    return `${formatScaledValue(numericValue / COMPACT_VALUE_LIMITS.thousandDivisor)}K`;
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Number.isInteger(numericValue) ? 0 : 2
  }).format(numericValue);
};

const formatScaledValue = (value) => {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.abs(value) < 10 ? 1 : 0
  }).format(value);
};

const CompactBarLabel = ({ x = 0, y = 0, width = 0, value }) => {
  if (value == null || width < BAR_LABEL_LAYOUT.minBarWidth) return null;

  const label = formatCompactChartValue(value);
  const estimatedLabelWidth = Math.max(
    label.length * BAR_LABEL_LAYOUT.estimatedCharacterWidth + BAR_LABEL_LAYOUT.horizontalPadding,
    BAR_LABEL_LAYOUT.minPillWidth
  );

  if (estimatedLabelWidth > width) return null;

  const labelWidth = Math.min(estimatedLabelWidth, width);
  const labelX = x + (width / 2) - (labelWidth / 2);
  const labelY = Math.max(y - BAR_LABEL_LAYOUT.verticalOffset, BAR_LABEL_LAYOUT.topInset);

  return (
    <g className="monthly-evolution-label">
      <rect
        className="monthly-evolution-label__pill"
        x={labelX}
        y={labelY}
        width={labelWidth}
        height={BAR_LABEL_LAYOUT.height}
        rx={BAR_LABEL_LAYOUT.radius}
      />
      <text
        className="monthly-evolution-label__text"
        x={x + (width / 2)}
        y={labelY + (BAR_LABEL_LAYOUT.height / 2)}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {label}
      </text>
    </g>
  );
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
    <section className="report-panel report-panel--monthly-evolution">
      <div className="report-panel__header monthly-evolution-header">
        <div>
          <span className="reports-eyebrow">Tendencia mensual</span>
          <h4>Evolución de Gastos Mensuales</h4>
        </div>
      </div>
      <div className="chart-shell chart-shell--monthly-evolution">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={MONTHLY_CHART_LAYOUT.margin}
            barCategoryGap={MONTHLY_CHART_LAYOUT.barCategoryGap}
            barGap={MONTHLY_CHART_LAYOUT.barGap}
          >
            <defs>
              <linearGradient id="monthlyEvolutionBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="48%" stopColor="#58a6ff" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="monthlyEvolutionBarHoverGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="44%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#58a6ff" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 10" stroke={CHART_THEME.grid} vertical={false} />
            <XAxis dataKey="month" stroke={CHART_THEME.axis} tickLine={false} axisLine={false} />
            <YAxis
              width={MONTHLY_CHART_LAYOUT.yAxisWidth}
              stroke={CHART_THEME.axis}
              tickLine={false}
              axisLine={false}
              tickMargin={MONTHLY_CHART_LAYOUT.tickMargin}
              tickFormatter={formatCompactChartValue}
            />
            <Tooltip
              cursor={{ fill: 'rgba(88, 166, 255, 0.08)' }}
              contentStyle={{ backgroundColor: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: '12px', color: '#edf6ff' }}
              labelStyle={{ color: '#7dd3fc', fontWeight: 800 }}
              itemStyle={{ color: '#edf6ff' }}
              formatter={(value) => formatCurrency(value)}
            />
            <Legend wrapperStyle={{ color: CHART_THEME.axis, paddingTop: '0.5rem' }} />
            <Bar
              dataKey="total"
              fill="url(#monthlyEvolutionBarGradient)"
              stroke="rgba(125, 211, 252, 0.34)"
              strokeWidth={1}
              radius={[12, 12, 4, 4]}
              maxBarSize={MONTHLY_CHART_LAYOUT.maxBarSize}
              name="Total Gastado"
              activeBar={{ fill: 'url(#monthlyEvolutionBarHoverGradient)', stroke: '#7dd3fc', strokeWidth: 1.5 }}
            >
              <LabelList dataKey="total" content={<CompactBarLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default MonthlyEvolution;
