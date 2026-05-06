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
      <h3>Reportes Inteligentes</h3>
      <div className="report-buttons">
        <button
          className={activeReport === 'efficiency' ? 'active' : ''}
          onClick={() => setActiveReport('efficiency')}
        >
          <FaGasPump />
          <span>Eficiencia</span>
        </button>
        <button
          className={activeReport === 'detail' ? 'active' : ''}
          onClick={() => setActiveReport('detail')}
        >
          <FaFileInvoiceDollar />
          <span>Detalle</span>
        </button>
        <button
          className={activeReport === 'comparison' ? 'active' : ''}
          onClick={() => setActiveReport('comparison')}
        >
          <FaExchangeAlt />
          <span>Comparativa</span>
        </button>
        <button
          className={activeReport === 'monthly' ? 'active' : ''}
          onClick={() => setActiveReport('monthly')}
        >
          <FaChartLine />
          <span>Evolución Mensual</span>
        </button>
        <button
          className={activeReport === 'category' ? 'active' : ''}
          onClick={() => setActiveReport('category')}
        >
          <FaChartPie />
          <span>Distribución</span>
        </button>
        <button
          className={activeReport === 'average' ? 'active' : ''}
          onClick={() => setActiveReport('average')}
        >
          <FaCalculator />
          <span>Promedios</span>
        </button>
        <button
          className={activeReport === 'log' ? 'active' : ''}
          onClick={() => setActiveReport('log')}
        >
          <FaTools />
          <span>Mantenimiento</span>
        </button>
      </div>

      <div className="report-content">
        {renderReport()}
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#3a3a3a' }} />

      <div>
        <h4>Exportar Datos</h4>
        <p style={{ color: '#aaa' }}>Descargue todos los gastos del vehículo seleccionado en formato CSV.</p>
        <button className="export-button" onClick={handleExportCSV} disabled={loading}>
          <FaFileCsv style={{ marginRight: '8px' }} />
          {loading ? 'Cargando datos...' : 'Descargar CSV'}
        </button>
      </div>
    </div>
  );
};

export default Reports;

