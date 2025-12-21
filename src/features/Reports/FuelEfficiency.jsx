// src/features/Reports/FuelEfficiency.jsx
import React from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../ExpenseHistory';
import './ReportTable.css';

const FuelEfficiency = () => {
  const { expenses, loading } = useExpenses();

  const calculateEfficiency = () => {
    const fuelStops = expenses
      .filter(e => e.category === 'Combustible' && e.odometer && e.gallons > 0)
      .sort((a, b) => a.odometer - b.odometer);

    if (fuelStops.length < 2) return { periods: [], averages: {} };

    const periods = [];
    let totalKm = 0;
    let totalGallons = 0;
    let totalCost = 0;

    for (let i = 1; i < fuelStops.length; i++) {
      const prevStop = fuelStops[i - 1];
      const currentStop = fuelStops[i];

      const kmTraveled = currentStop.odometer - prevStop.odometer;
      const gallonsUsed = currentStop.gallons; // Efficiency is calculated on the fill-up
      const cost = currentStop.amount;

      if (kmTraveled > 0) {
        totalKm += kmTraveled;
        totalGallons += gallonsUsed;
        totalCost += cost;

        periods.push({
          id: currentStop.id,
          period: `${prevStop.date.slice(5)} -> ${currentStop.date.slice(5)}`,
          kmTraveled,
          gallonsUsed,
          efficiency: kmTraveled / gallonsUsed,
          costPerKm: cost / kmTraveled,
        });
      }
    }
    
    const averages = {
        avgEfficiency: totalGallons > 0 ? totalKm / totalGallons : 0,
        avgCostPerKm: totalKm > 0 ? totalCost / totalKm : 0,
    };

    return { periods: periods.reverse(), averages };
  };

  const { periods, averages } = calculateEfficiency();

  if (loading) return <p>Cargando datos del reporte...</p>;
  
  if (periods.length === 0) {
    return <p>No hay suficientes datos para este reporte. Se necesitan al menos dos registros de combustible con kilometraje y galones.</p>;
  }

  return (
    <div>
      <h4>Análisis de Eficiencia de Combustible</h4>
      <div className="comparison-container" style={{ marginBottom: '2rem' }}>
        <div className="card">
            <span className="card-title">Rendimiento Promedio</span>
            <span className="card-value">{averages.avgEfficiency.toFixed(2)} km/Gal</span>
        </div>
        <div className="card">
            <span className="card-title">Costo Promedio por Km</span>
            <span className="card-value">{formatCurrency(averages.avgCostPerKm)}</span>
        </div>
      </div>
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Periodo (Fecha)</th>
              <th>Km Recorridos</th>
              <th>Galones Usados</th>
              <th>Rendimiento (km/Gal)</th>
              <th style={{ textAlign: 'right' }}>Costo / Km</th>
            </tr>
          </thead>
          <tbody>
            {periods.map(p => (
              <tr key={p.id}>
                <td>{p.period}</td>
                <td>{p.kmTraveled.toLocaleString('es-CO')} km</td>
                <td>{p.gallonsUsed.toFixed(2)} Gal</td>
                <td>{p.efficiency.toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(p.costPerKm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FuelEfficiency;
