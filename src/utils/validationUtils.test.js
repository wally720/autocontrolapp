import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidPlate } from './validationUtils.js';

test('isValidPlate acepta placas alfanuméricas simples', () => {
  assert.equal(isValidPlate('ABC123'), true);
  assert.equal(isValidPlate('XYZ7890'), true);
  assert.equal(isValidPlate('123456'), true);
  assert.equal(isValidPlate('ABCDEF'), true);
});

test('isValidPlate rechaza placas con caracteres especiales', () => {
  assert.equal(isValidPlate('ABC-123'), false);
  assert.equal(isValidPlate('ABC.123'), false);
  assert.equal(isValidPlate('ABC 123'), false);
  assert.equal(isValidPlate('ABC_123'), false);
  assert.equal(isValidPlate('ABC/123'), false);
});

test('isValidPlate rechaza placas con minúsculas', () => {
  // Nota: Aunque solemos hacer trim().toUpperCase() antes, la utilidad de validación
  // por sí sola debe ser estricta según su regex.
  assert.equal(isValidPlate('abc123'), false);
});

test('isValidPlate rechaza cadenas vacías', () => {
  assert.equal(isValidPlate(''), false);
});

test('isValidPlate rechaza inyecciones o caracteres maliciosos', () => {
  assert.equal(isValidPlate('<script>'), false);
  assert.equal(isValidPlate('OR 1=1'), false);
  assert.equal(isValidPlate('; DROP TABLE'), false);
});
