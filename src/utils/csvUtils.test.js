import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeForCSV, generateCSV } from './csvUtils.js';

test('sanitizeForCSV maneja cadenas normales', () => {
  assert.equal(sanitizeForCSV('test'), '"test"');
});

test('sanitizeForCSV maneja cadenas con comas', () => {
  assert.equal(sanitizeForCSV('test,1'), '"test,1"');
});

test('sanitizeForCSV maneja cadenas con comillas', () => {
  assert.equal(sanitizeForCSV('test"1'), '"test""1"');
});

test('sanitizeForCSV maneja caracteres de inyección CSV', () => {
  assert.equal(sanitizeForCSV('=1+1'), '"\'=1+1"');
  assert.equal(sanitizeForCSV('+1+1'), '"\'+1+1"');
  assert.equal(sanitizeForCSV('-1+1'), '"\'-1+1"');
  assert.equal(sanitizeForCSV('@SUM(1,2)'), '"\'@SUM(1,2)"');
});

test('sanitizeForCSV maneja inyección con espacios iniciales', () => {
  assert.equal(sanitizeForCSV(' =1+1'), '"\' =1+1"');
  assert.equal(sanitizeForCSV('\t+1+1'), '"\'\t+1+1"');
  assert.equal(sanitizeForCSV('\n-1+1'), '"\'\n-1+1"');
});

test('sanitizeForCSV maneja números', () => {
  assert.equal(sanitizeForCSV(123), '"123"');
});

test('sanitizeForCSV maneja null y undefined', () => {
  assert.equal(sanitizeForCSV(null), '""');
  assert.equal(sanitizeForCSV(undefined), '""');
});

test('sanitizeForCSV maneja inyección con comas', () => {
  assert.equal(sanitizeForCSV('=SUM(A1,A2)'), '"\'=SUM(A1,A2)"');
});

test('generateCSV agrega BOM y formatea correctamente', () => {
  const headers = ['Col1', 'Col2'];
  const data = [['Val1', 'Val2'], ['Val3', 'Val4']];
  const expected = '\ufeff"Col1","Col2"\n"Val1","Val2"\n"Val3","Val4"';
  assert.equal(generateCSV(headers, data), expected);
});

test('generateCSV sanitiza datos', () => {
  const headers = ['Formula', 'Normal'];
  const data = [['=1+1', 'Test'], ['@SUM', 'Data']];
  const expected = '\ufeff"Formula","Normal"\n"\'=1+1","Test"\n"\'@SUM","Data"';
  assert.equal(generateCSV(headers, data), expected);
});

test('generateCSV sanitiza encabezados', () => {
  const headers = ['Col,1', 'Col"2'];
  const data = [['Val1', 'Val2']];
  const expected = '\ufeff"Col,1","Col""2"\n"Val1","Val2"';
  assert.equal(generateCSV(headers, data), expected);
});
