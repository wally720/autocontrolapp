// src/features/Reports/index.jsx
import { useEffect, useMemo, useState } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { getLocalDate } from '../../utils/dateUtils';
import { generateCSV, downloadCSV } from '../../utils/csvUtils';
import { useSearchParams } from 'react-router-dom';
import MonthlyEvolution from './MonthlyEvolution';
import CategoryDistribution from './CategoryDistribution';
import MaintenanceLog from './MaintenanceLog';
import AverageByCategory from './AverageByCategory';
import MonthlyComparison from './MonthlyComparison';
import FuelEfficiency from './FuelEfficiency';
import ExpenseDetail from './ExpenseDetail';
import { useNotification } from '../../context/NotificationContext';
import {
  FaChartLine, FaChartPie, FaTools, FaFileCsv, FaCalculator, FaExchangeAlt, FaGasPump, FaFileInvoiceDollar
} from 'react-icons/fa';
import { formatCurrency } from '../ExpenseHistory';
import './Reports.css';

const REPORT_TABS = [
  { id: 'efficiency', label: 'Eficiencia', icon: FaGasPump },
  { id: 'detail', label: 'Detalle', icon: FaFileInvoiceDollar },
  { id: 'comparison', label: 'Comparativa', icon: FaExchangeAlt },
  { id: 'monthly', label: 'Evolución Mensual', icon: FaChartLine },
  { id: 'category', label: 'Distribución', icon: FaChartPie },
  { id: 'average', label: 'Promedios', icon: FaCalculator },
  { id: 'log', label: 'Mantenimiento', icon: FaTools }
];

const REPORTS_WITH_KPIS = new Set(['detail', 'category', 'average']);

const PERIOD_OPTIONS = [
  { value: 'current-month', label: 'Este mes' },
  { value: 'previous-month', label: 'Mes anterior' },
  { value: 'last-3-months', label: 'Últimos 3 meses' },
  { value: 'current-year', label: 'Año actual' },
  { value: 'custom', label: 'Rango personalizado' }
];

const toDateInputValue = (date) => getLocalDate(date);

const getPeriodRange = (period) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (period === 'previous-month') {
    return {
      startDate: toDateInputValue(new Date(year, month - 1, 1)),
      endDate: toDateInputValue(new Date(year, month, 0))
    };
  }

  if (period === 'last-3-months') {
    const start = new Date(today);
    start.setMonth(start.getMonth() - 2, 1);
    return {
      startDate: toDateInputValue(start),
      endDate: toDateInputValue(today)
    };
  }

  if (period === 'current-year') {
    return {
      startDate: toDateInputValue(new Date(year, 0, 1)),
      endDate: toDateInputValue(today)
    };
  }

  return {
    startDate: toDateInputValue(new Date(year, month, 1)),
    endDate: toDateInputValue(today)
  };
};

const getMonthSpan = (startDate, endDate) => {
  if (!startDate || !endDate) return 1;

  const [startYear, startMonth] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);
  const span = ((endYear - startYear) * 12) + endMonth - startMonth + 1;

  return Math.max(span, 1);
};

const buildReportKpis = (filteredExpenses, startDate, endDate) => {
  const total = filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    if (!expense.category) return acc;

    acc[expense.category] = (acc[expense.category] || 0) + (Number(expense.amount) || 0);
    return acc;
  }, {});
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const monthSpan = getMonthSpan(startDate, endDate);

  return {
    total,
    count: filteredExpenses.length,
    topCategory,
    averageMonthly: total / monthSpan
  };
};

const Reports = () => {
  const { expenses, loading } = useExpenses();
  const { showNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const initialReport = searchParams.get('report') === 'detail' ? 'detail' : 'efficiency';
  const [activeReport, setActiveReport] = useState(initialReport); // Default to new report
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [customRange, setCustomRange] = useState(() => getPeriodRange('current-month'));

  const activeRange = useMemo(() => {
    if (selectedPeriod === 'custom') return customRange;

    return getPeriodRange(selectedPeriod);
  }, [customRange, selectedPeriod]);

  const filteredExpenses = useMemo(() => {
    if (!activeRange.startDate || !activeRange.endDate) return [];

    return expenses.filter(expense => expense.date >= activeRange.startDate && expense.date <= activeRange.endDate);
  }, [activeRange, expenses]);

  const kpis = useMemo(() => buildReportKpis(filteredExpenses, activeRange.startDate, activeRange.endDate), [activeRange, filteredExpenses]);
  const shouldShowKpis = REPORTS_WITH_KPIS.has(activeReport);

  useEffect(() => {
    setActiveReport(initialReport);
  }, [initialReport]);

  const handleExportCSV = () => {
    if (loading || expenses.length === 0) {
      showNotification('No hay datos para exportar o los datos aún se están cargando.', 'error');
      return;
    }

    const headers = ["ID", "Vehículo", "Fecha", "Categoría", "Monto", "Notas", "Kilometraje", "Galones"];

    // Preparar el array de datos sin procesar
    const data = expenses.map(expense => [
      expense.id,
      expense.vehicleId,
      expense.date,
      expense.category,
      expense.amount,
      expense.notes,
      expense.odometer,
      expense.gallons
    ]);

    const csvString = generateCSV(headers, data);
    const fileName = `gastos_${expenses.length > 0 ? expenses[0].vehicleId : 'export'}_${getLocalDate()}.csv`;

    downloadCSV(csvString, fileName);
    showNotification('CSV exportado correctamente.', 'success');
  };

  const handlePeriodChange = (event) => {
    const nextPeriod = event.target.value;
    setSelectedPeriod(nextPeriod);

    if (nextPeriod !== 'custom') {
      setCustomRange(getPeriodRange(nextPeriod));
    }
  };

  const handleCustomDateChange = (field, value) => {
    setSelectedPeriod('custom');
    setCustomRange(previous => ({ ...previous, [field]: value }));
  };

  const sharedReportProps = {
    expenses: filteredExpenses,
    loading,
    globalRange: activeRange
  };

  const renderReport = () => {
    switch (activeReport) {
      case 'efficiency':
        return <FuelEfficiency {...sharedReportProps} />;
      case 'detail':
        return <ExpenseDetail {...sharedReportProps} />;
      case 'comparison':
        return <MonthlyComparison {...sharedReportProps} />;
      case 'monthly':
        return <MonthlyEvolution {...sharedReportProps} />;
      case 'category':
        return <CategoryDistribution {...sharedReportProps} />;
      case 'average':
        return <AverageByCategory {...sharedReportProps} />;
      case 'log':
        return <MaintenanceLog {...sharedReportProps} />;
      default:
        return <FuelEfficiency {...sharedReportProps} />;
    }
  };

  return (
    <div className="reports-container">
      <div className="report-buttons" role="tablist" aria-label="Tipos de reporte">
        {REPORT_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeReport === id}
            className={activeReport === id ? 'active' : ''}
            onClick={() => setActiveReport(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <section className="reports-period-panel" aria-labelledby="period-title">
        <div className="reports-period-panel__header">
          <div>
            <span className="reports-eyebrow">Periodo global</span>
            <h4 id="period-title">Filtro de análisis</h4>
            <p>Todos los reportes usan este rango como base del cálculo.</p>
          </div>
          <div className="reports-period-summary" aria-live="polite">
            {activeRange.startDate || 'Sin inicio'} <span>→</span> {activeRange.endDate || 'Sin cierre'}
          </div>
        </div>

        <div className="reports-period-controls">
          <label className="reports-filter-field" htmlFor="report-period">
            <span>Vista rápida</span>
            <select id="report-period" value={selectedPeriod} onChange={handlePeriodChange}>
              {PERIOD_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="reports-filter-field" htmlFor="report-start-date">
            <span>Desde</span>
            <input
              id="report-start-date"
              type="date"
              value={activeRange.startDate}
              onChange={(event) => handleCustomDateChange('startDate', event.target.value)}
            />
          </label>

          <label className="reports-filter-field" htmlFor="report-end-date">
            <span>Hasta</span>
            <input
              id="report-end-date"
              type="date"
              value={activeRange.endDate}
              onChange={(event) => handleCustomDateChange('endDate', event.target.value)}
            />
          </label>
        </div>
      </section>

      {shouldShowKpis && (
        <section className="reports-kpi-grid" aria-label="Indicadores del periodo seleccionado">
          <article className="reports-kpi-card reports-kpi-card--primary">
            <span>Total del periodo</span>
            <strong>{loading ? '...' : formatCurrency(kpis.total)}</strong>
          </article>
          <article className="reports-kpi-card">
            <span>Gastos registrados</span>
            <strong>{loading ? '...' : kpis.count}</strong>
          </article>
          <article className="reports-kpi-card">
            <span>Categoría mayor</span>
            <strong>{kpis.topCategory ? kpis.topCategory[0] : 'Sin datos'}</strong>
            <small>{kpis.topCategory ? formatCurrency(kpis.topCategory[1]) : 'No hay gastos en el rango'}</small>
          </article>
          <article className="reports-kpi-card">
            <span>Promedio mensual aprox.</span>
            <strong>{loading ? '...' : formatCurrency(kpis.averageMonthly)}</strong>
          </article>
        </section>
      )}

      <div className="report-content">
        {renderReport()}
      </div>

      <section className="report-export-panel" aria-labelledby="export-title">
        <div>
          <span className="reports-eyebrow">Salida de datos</span>
          <h4 id="export-title">Exportar Datos</h4>
          <p>Descargue todos los gastos del vehículo seleccionado en formato CSV.</p>
        </div>
        <button className="export-button" onClick={handleExportCSV} disabled={loading}>
          <FaFileCsv />
          {loading ? 'Cargando datos...' : 'Descargar CSV'}
        </button>
      </section>
    </div>
  );
};

export default Reports;

