import test from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORY_FUEL, CATEGORY_MAINTENANCE } from './constants.js';
import {
  DEFAULT_FUEL_TYPE,
  FUEL_TYPE_DIESEL,
  FUEL_TYPE_NORMAL,
  FUEL_TYPE_PREMIUM,
  FUEL_TYPE_OPTIONS,
  getExpenseFuelTypeDisplay,
  getFuelTypeOption,
  normalizeFuelType,
} from './fuelTypeUtils.js';

test('normalizeFuelType usa Normal por defecto para valores legacy o inválidos', () => {
  assert.equal(normalizeFuelType(undefined), DEFAULT_FUEL_TYPE);
  assert.equal(normalizeFuelType(null), DEFAULT_FUEL_TYPE);
  assert.equal(normalizeFuelType(''), DEFAULT_FUEL_TYPE);
  assert.equal(normalizeFuelType('legacy'), DEFAULT_FUEL_TYPE);
});

test('FUEL_TYPE_OPTIONS incluye Diesel antes de Otro', () => {
  assert.deepEqual(
    FUEL_TYPE_OPTIONS.map(option => option.value),
    [FUEL_TYPE_NORMAL, FUEL_TYPE_PREMIUM, FUEL_TYPE_DIESEL, 'other']
  );
});

test('getFuelTypeOption devuelve label y tooltip para tipos válidos', () => {
  assert.deepEqual(
    getFuelTypeOption(FUEL_TYPE_PREMIUM),
    {
      value: FUEL_TYPE_PREMIUM,
      label: 'Premium',
      abbreviation: 'PREM',
      tooltip: 'Extra',
      className: 'fuel-type-premium',
    }
  );
});

test('getFuelTypeOption devuelve Diesel como tipo válido', () => {
  assert.deepEqual(
    getFuelTypeOption(FUEL_TYPE_DIESEL),
    {
      value: FUEL_TYPE_DIESEL,
      label: 'Diesel',
      abbreviation: 'DSL',
      tooltip: 'Diesel',
      className: 'fuel-type-diesel',
    }
  );
});

test('getFuelTypeOption muestra Otro en display visible', () => {
  assert.deepEqual(
    getFuelTypeOption('other'),
    {
      value: 'other',
      label: 'Otro',
      abbreviation: 'OTRO',
      tooltip: 'Otro',
      className: 'fuel-type-other',
    }
  );
});

test('getExpenseFuelTypeDisplay muestra Normal en combustible legacy sin fuelType', () => {
  assert.deepEqual(
    getExpenseFuelTypeDisplay({ category: CATEGORY_FUEL }),
    {
      value: FUEL_TYPE_NORMAL,
      label: 'Normal',
      abbreviation: 'NORM',
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
