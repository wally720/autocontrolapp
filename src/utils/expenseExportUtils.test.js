import test from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORY_FUEL, CATEGORY_MAINTENANCE } from './constants.js';
import { prepareExpenseCsvData } from './expenseExportUtils.js';

test('prepareExpenseCsvData mantiene el contrato de headers y datos de odómetro/galones', () => {
  const { headers, data } = prepareExpenseCsvData([
    {
      id: 'fuel-1',
      vehicleId: 'ABC123',
      date: '2026-06-01',
      category: CATEGORY_FUEL,
      amount: 120000,
      notes: 'Tanque lleno',
      odometer: 12345,
      gallons: 10.5
    },
    {
      id: 'maintenance-1',
      vehicleId: 'ABC123',
      date: '2026-06-02',
      category: CATEGORY_MAINTENANCE,
      amount: 80000,
      notes: 'Cambio aceite',
      odometer: 12400,
      gallons: 99
    }
  ]);

  assert.deepEqual(headers, [
    'ID',
    'Vehículo',
    'Fecha',
    'Categoría',
    'Monto',
    'Notas',
    'Odómetro (kilometraje)',
    'Galones'
  ]);

  assert.deepEqual(data, [
    ['fuel-1', 'ABC123', '2026-06-01', CATEGORY_FUEL, 120000, 'Tanque lleno', 12345, 10.5],
    ['maintenance-1', 'ABC123', '2026-06-02', CATEGORY_MAINTENANCE, 80000, 'Cambio aceite', 12400, '']
  ]);
});
