import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidPlate, isValidDateString } from './validationUtils.js';

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

test('isValidDateString acepta formatos AAAA-MM-DD correctos', () => {
  assert.equal(isValidDateString('2024-05-20'), true);
  assert.equal(isValidDateString('1999-12-31'), true);
  assert.equal(isValidDateString('2000-01-01'), true);
});

test('isValidDateString rechaza formatos incorrectos', () => {
  assert.equal(isValidDateString('20-05-2024'), false);
  assert.equal(isValidDateString('2024/05/20'), false);
  assert.equal(isValidDateString('2024.05.20'), false);
  assert.equal(isValidDateString('2024-5-20'), false);
  assert.equal(isValidDateString('24-05-20'), false);
});

test('isValidDateString rechaza valores no string o vacíos', () => {
  assert.equal(isValidDateString(''), false);
  assert.equal(isValidDateString(null), false);
  assert.equal(isValidDateString(undefined), false);
  assert.equal(isValidDateString(20240520), false);
  assert.equal(isValidDateString({ date: '2024-05-20' }), false);
});

test('isValidDateString rechaza inyecciones o caracteres maliciosos', () => {
  assert.equal(isValidDateString('2024-05-20; DROP TABLE'), false);
  assert.equal(isValidDateString('<script>alert(1)</script>'), false);
  assert.equal(isValidDateString('2024-05-20" OR "1"="1'), false);
});
