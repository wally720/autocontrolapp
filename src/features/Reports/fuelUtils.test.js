import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEfficiency } from './fuelUtils.js';

test('calculateEfficiency returns empty periods and averages when expenses list is empty', () => {
  const expenses = [];
  const result = calculateEfficiency(expenses);
  assert.deepEqual(result, { periods: [], averages: {} });
});

test('calculateEfficiency returns empty periods when there is only one fuel stop', () => {
  const expenses = [
    { id: '1', category: 'Combustible', odometer: 1000, gallons: 10, date: '2023-01-01', amount: 50 }
  ];
  const result = calculateEfficiency(expenses);
  assert.deepEqual(result, { periods: [], averages: {} });
});

test('calculateEfficiency calculates efficiency correctly for multiple fuel stops', () => {
  const expenses = [
    { id: '1', category: 'Combustible', odometer: 1000, gallons: 10, date: '2023-01-01', amount: 50 },
    { id: '2', category: 'Combustible', odometer: 1500, gallons: 10, date: '2023-01-10', amount: 60 },
  ];
  const result = calculateEfficiency(expenses);

  assert.strictEqual(result.periods.length, 1);
  assert.strictEqual(result.periods[0].kmTraveled, 500);
  assert.strictEqual(result.periods[0].gallonsUsed, 10);
  assert.strictEqual(result.periods[0].efficiency, 50);
  assert.strictEqual(result.periods[0].costPerKm, 60 / 500);

  assert.strictEqual(result.averages.avgEfficiency, 50);
  assert.strictEqual(result.averages.avgCostPerKm, 60 / 500);
});

test('calculateEfficiency filters out non-combustible expenses', () => {
  const expenses = [
    { id: '1', category: 'Combustible', odometer: 1000, gallons: 10, date: '2023-01-01', amount: 50 },
    { id: '2', category: 'Lavado', odometer: 1200, gallons: 0, date: '2023-01-05', amount: 15 },
    { id: '3', category: 'Combustible', odometer: 1500, gallons: 10, date: '2023-01-10', amount: 60 },
  ];
  const result = calculateEfficiency(expenses);

  assert.strictEqual(result.periods.length, 1);
  assert.strictEqual(result.periods[0].kmTraveled, 500);
});

test('calculateEfficiency filters out stops with zero or missing gallons/odometer', () => {
  const expenses = [
    { id: '1', category: 'Combustible', odometer: 1000, gallons: 10, date: '2023-01-01', amount: 50 },
    { id: '2', category: 'Combustible', odometer: 1200, gallons: 0, date: '2023-01-05', amount: 20 }, // zero gallons
    { id: '3', category: 'Combustible', date: '2023-01-06', amount: 20 }, // missing odometer
    { id: '4', category: 'Combustible', odometer: 1500, gallons: 10, date: '2023-01-10', amount: 60 },
  ];
  const result = calculateEfficiency(expenses);

  assert.strictEqual(result.periods.length, 1);
  assert.strictEqual(result.periods[0].kmTraveled, 500);
});

test('calculateEfficiency sorts stops by odometer', () => {
  const expenses = [
    { id: '2', category: 'Combustible', odometer: 1500, gallons: 10, date: '2023-01-10', amount: 60 },
    { id: '1', category: 'Combustible', odometer: 1000, gallons: 10, date: '2023-01-01', amount: 50 },
  ];
  const result = calculateEfficiency(expenses);

  assert.strictEqual(result.periods.length, 1);
  assert.strictEqual(result.periods[0].kmTraveled, 500);
});

test('calculateEfficiency handles non-increasing odometer values by skipping them', () => {
  const expenses = [
    { id: '1', category: 'Combustible', odometer: 1000, gallons: 10, date: '2023-01-01', amount: 50 },
    { id: '2', category: 'Combustible', odometer: 900, gallons: 10, date: '2023-01-05', amount: 50 },
    { id: '3', category: 'Combustible', odometer: 1500, gallons: 10, date: '2023-01-10', amount: 60 },
  ];
  const result = calculateEfficiency(expenses);

  // Sorted stops: 900, 1000, 1500
  // Period 1: 1000 - 900 = 100km, 10 gal -> 10km/gal
  // Period 2: 1500 - 1000 = 500km, 10 gal -> 50km/gal
  assert.strictEqual(result.periods.length, 2);
  assert.strictEqual(result.periods[0].kmTraveled, 500); // reverse order
  assert.strictEqual(result.periods[1].kmTraveled, 100);
});

test('calculateEfficiency calculates averages correctly for multiple periods', () => {
  const expenses = [
    { id: '1', category: 'Combustible', odometer: 1000, gallons: 10, date: '2023-01-01', amount: 50 },
    { id: '2', category: 'Combustible', odometer: 1500, gallons: 10, date: '2023-01-10', amount: 60 },
    { id: '3', category: 'Combustible', odometer: 2100, gallons: 12, date: '2023-01-20', amount: 72 },
  ];
  const result = calculateEfficiency(expenses);

  // Period 1: 500km, 10 gal, 60 cost
  // Period 2: 600km, 12 gal, 72 cost
  // Total: 1100km, 22 gal, 132 cost
  // Avg efficiency: 1100 / 22 = 50
  // Avg cost/km: 132 / 1100 = 0.12

  assert.strictEqual(result.averages.avgEfficiency, 50);
  assert.strictEqual(result.averages.avgCostPerKm, 0.12);
});
