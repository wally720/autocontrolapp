import test from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORY_FUEL, CATEGORY_MAINTENANCE } from './constants.js';
import {
  formatOdometerDisplay,
  getExpenseVehicleDetailDisplays,
} from './expenseDisplayUtils.js';

const formatInteger = (value) => new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
}).format(value);

const formatGallons = (value) => new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value);

test('formatOdometerDisplay muestra y formatea odómetro numérico si existe', () => {
  assert.equal(formatOdometerDisplay(12345), `${formatInteger(12345)} km`);
});

test('formatOdometerDisplay maneja odómetro string legacy sin crashear', () => {
  assert.equal(formatOdometerDisplay('12345'), `${formatInteger(12345)} km`);
});

test('formatOdometerDisplay no muestra valores vacíos, null o undefined', () => {
  assert.equal(formatOdometerDisplay(''), null);
  assert.equal(formatOdometerDisplay('   '), null);
  assert.equal(formatOdometerDisplay(null), null);
  assert.equal(formatOdometerDisplay(undefined), null);
});

test('getExpenseVehicleDetailDisplays muestra galones solo para combustible y soporta string numeric legacy', () => {
  assert.deepEqual(
    getExpenseVehicleDetailDisplays({
      category: CATEGORY_FUEL,
      odometer: 12345,
      gallons: '10.5',
    }),
    [`${formatInteger(12345)} km`, `${formatGallons(10.5)} Gal`]
  );
});

test('getExpenseVehicleDetailDisplays no muestra galones en gastos no combustible aunque exista el valor', () => {
  assert.deepEqual(
    getExpenseVehicleDetailDisplays({
      category: CATEGORY_MAINTENANCE,
      odometer: 12345,
      gallons: '10.5',
    }),
    [`${formatInteger(12345)} km`]
  );
});

test('getExpenseVehicleDetailDisplays omite detalles sin valores visibles', () => {
  assert.deepEqual(
    getExpenseVehicleDetailDisplays({
      category: CATEGORY_FUEL,
      odometer: null,
      gallons: undefined,
    }),
    []
  );
});
