// src/features/Reports/index.jsx
import { useEffect, useState } from 'react';
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

const Reports = () => {
  const { expenses, loading } = useExpenses();
  const { showNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const initialReport = searchParams.get('report') === 'detail' ? 'detail' : 'efficiency';
  const [activeReport, setActiveReport] = useState(initialReport); // Default to new report

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

  const renderReport = () => {
    switch (activeReport) {
      case 'efficiency':
        return <FuelEfficiency />;
      case 'detail':
        return <ExpenseDetail />;
      case 'comparison':
        return <MonthlyComparison />;
      case 'monthly':
        return <MonthlyEvolution />;
      case 'category':
        return <CategoryDistribution />;
      case 'average':
        return <AverageByCategory />;
      case 'log':
        return <MaintenanceLog />;
      default:
        return <FuelEfficiency />;
    }
  };

  return (
    <div className="reports-container">
      <header className="reports-hero" aria-labelledby="reports-title">
        <div className="reports-hero__copy">
          <span className="reports-eyebrow">Centro analítico</span>
          <h3 id="reports-title">Reportes Inteligentes</h3>
          <p>Lectura financiera del vehículo con paneles, comparativas y detalle exportable.</p>
        </div>
        <div className="reports-hero__status" aria-label="Estado de datos del reporte">
          <span className="reports-status-label">Registros cargados</span>
          <strong>{loading ? '...' : expenses.length}</strong>
        </div>
      </header>

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

