import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeForCSV } from './csvUtils.js';

test('sanitizeForCSV handles normal strings', () => {
  assert.equal(sanitizeForCSV('test'), '"test"');
});

test('sanitizeForCSV handles strings with commas', () => {
  assert.equal(sanitizeForCSV('test,1'), '"test,1"');
});

test('sanitizeForCSV handles strings with quotes', () => {
  assert.equal(sanitizeForCSV('test"1'), '"test""1"');
});

test('sanitizeForCSV handles CSV injection characters', () => {
  assert.equal(sanitizeForCSV('=1+1'), '"\'=1+1"');
  assert.equal(sanitizeForCSV('+1+1'), '"\'+1+1"');
  assert.equal(sanitizeForCSV('-1+1'), '"\'-1+1"');
  assert.equal(sanitizeForCSV('@SUM(1,2)'), '"\'@SUM(1,2)"');
});

test('sanitizeForCSV handles numbers', () => {
  assert.equal(sanitizeForCSV(123), '"123"');
});

test('sanitizeForCSV handles null and undefined', () => {
  assert.equal(sanitizeForCSV(null), '""');
  assert.equal(sanitizeForCSV(undefined), '""');
});

test('sanitizeForCSV handles injection with commas', () => {
  assert.equal(sanitizeForCSV('=SUM(A1,A2)'), '"\'=SUM(A1,A2)"');
});
