// src/features/Reports/index.jsx
import React, { useState } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import MonthlyEvolution from './MonthlyEvolution';
import CategoryDistribution from './CategoryDistribution';
import MaintenanceLog from './MaintenanceLog';
import AverageByCategory from './AverageByCategory';
import MonthlyComparison from './MonthlyComparison';
import FuelEfficiency from './FuelEfficiency';
import {
  FaChartLine, FaChartPie, FaTools, FaFileCsv, FaCalculator, FaExchangeAlt, FaGasPump
} from 'react-icons/fa';
import './Reports.css';

const Reports = () => {
  const { expenses, loading } = useExpenses();
  const [activeReport, setActiveReport] = useState('efficiency'); // Default to new report

  // Función para obtener la fecha local en formato YYYY-MM-DD
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const handleExportCSV = () => {
    if (loading || expenses.length === 0) {
      alert("No hay datos para exportar o los datos aún se están cargando.");
      return;
    }

    const headers = ["ID", "Vehículo", "Fecha", "Categoría", "Monto", "Notas", "Kilometraje", "Galones"];
    const csvRows = [headers.join(',')];

    expenses.forEach(expense => {
      const notes = expense.notes ? `"${expense.notes.replace(/"/g, '""')}"` : '';
      const row = [
        expense.id,
        expense.vehicleId,
        expense.date,
        expense.category,
        expense.amount,
        notes,
        expense.odometer || '', // Añadir si existe
        expense.gallons || ''     // Añadir si existe
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `gastos_${expenses.length > 0 ? expenses[0].vehicleId : 'export'}_${getLocalDate()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderReport = () => {
    switch (activeReport) {
      case 'efficiency':
        return <FuelEfficiency />;
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

