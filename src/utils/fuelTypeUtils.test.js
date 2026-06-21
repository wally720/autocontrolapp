import test from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORY_FUEL, CATEGORY_MAINTENANCE } from './constants.js';
import {
  DEFAULT_FUEL_TYPE,
  FUEL_TYPE_NORMAL,
  FUEL_TYPE_PREMIUM,
  getExpenseFuelTypeDisplay,
  getFuelTypeOption,
  normalizeFuelType,
} from './fuelTypeUtils.js';

test('normalizeFuelType usa Normal por defecto para valores legacy o inválidos', () => {
  assert.equal(normalizeFuelType(undefined), DEFAULT_FUEL_TYPE);
  assert.equal(normalizeFuelType(null), DEFAULT_FUEL_TYPE);
  assert.equal(normalizeFuelType(''), DEFAULT_FUEL_TYPE);
  assert.equal(normalizeFuelType('diesel'), DEFAULT_FUEL_TYPE);
});

test('getFuelTypeOption devuelve label y tooltip para tipos válidos', () => {
  assert.deepEqual(
    getFuelTypeOption(FUEL_TYPE_PREMIUM),
    {
      value: FUEL_TYPE_PREMIUM,
      label: 'Premium',
      tooltip: 'Extra',
      className: 'fuel-type-premium',
    }
  );
});

test('getExpenseFuelTypeDisplay muestra Normal en combustible legacy sin fuelType', () => {
  assert.deepEqual(
    getExpenseFuelTypeDisplay({ category: CATEGORY_FUEL }),
    {
      value: FUEL_TYPE_NORMAL,
      label: 'Normal',
      tooltip: 'Corriente',
      className: 'fuel-type-tag fuel-type-normal',
    }
  );
});

test('getExpenseFuelTypeDisplay no muestra tag en gastos no combustible', () => {
  assert.equal(
    getExpenseFuelTypeDisplay({ category: CATEGORY_MAINTENANCE, fuelType: FUEL_TYPE_PREMIUM }),
    null
  );
});
