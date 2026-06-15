import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as constants from './constants.js';

test('Las constantes de categorías tienen los valores correctos', () => {
  assert.strictEqual(constants.CATEGORY_FUEL, 'Combustible');
  assert.strictEqual(constants.CATEGORY_MAINTENANCE, 'Mantenimiento');
  assert.strictEqual(constants.CATEGORY_INSURANCE, 'Seguros/Papeles');
  assert.strictEqual(constants.CATEGORY_TAXES, 'Impuestos');
  assert.strictEqual(constants.CATEGORY_WASH, 'Lavado');
  assert.strictEqual(constants.CATEGORY_PARKING, 'Parqueadero');
  assert.strictEqual(constants.CATEGORY_TOLLS, 'Peajes');
  assert.strictEqual(constants.CATEGORY_TIRES, 'Llantas');
  assert.strictEqual(constants.CATEGORY_OTHER, 'Otros');
});

test('El objeto CATEGORIES contiene todas las categorías mapeadas correctamente', () => {
  assert.deepStrictEqual(constants.CATEGORIES, {
    FUEL: constants.CATEGORY_FUEL,
    MAINTENANCE: constants.CATEGORY_MAINTENANCE,
    INSURANCE: constants.CATEGORY_INSURANCE,
    TAXES: constants.CATEGORY_TAXES,
    WASH: constants.CATEGORY_WASH,
    PARKING: constants.CATEGORY_PARKING,
    TOLLS: constants.CATEGORY_TOLLS,
    TIRES: constants.CATEGORY_TIRES,
    OTHER: constants.CATEGORY_OTHER,
  });
});

test('La lista CATEGORY_LIST contiene todas las categorías en el orden esperado', () => {
  const expectedList = [
    constants.CATEGORY_FUEL,
    constants.CATEGORY_MAINTENANCE,
    constants.CATEGORY_INSURANCE,
    constants.CATEGORY_TAXES,
    constants.CATEGORY_WASH,
    constants.CATEGORY_PARKING,
    constants.CATEGORY_TOLLS,
    constants.CATEGORY_TIRES,
    constants.CATEGORY_OTHER,
  ];
  assert.deepStrictEqual(constants.CATEGORY_LIST, expectedList);
});

test('Las constantes de límites de la aplicación son correctas', () => {
  assert.strictEqual(constants.MAX_VEHICLES_PER_USER, 2);
  assert.strictEqual(constants.MAX_VEHICLES_ERROR_MSG, "Solo puedes tener un máximo de 2 placas.");
});

test('La versión de la aplicación es correcta', () => {
  assert.strictEqual(constants.APP_VERSION, '1.6.0');
});
