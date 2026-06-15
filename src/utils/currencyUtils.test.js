import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency } from './currencyUtils.js';

test('formatCurrency should format positive numbers as USD', () => {
  const result = formatCurrency(1000);
  // Using regex to handle different types of spaces (like non-breaking spaces)
  assert.match(result, /\$1,000/);
});

test('formatCurrency should handle decimal values', () => {
  const result = formatCurrency(1234.56);
  assert.match(result, /\$1,234\.56/);
});

test('formatCurrency should round to 2 decimal places', () => {
  const result = formatCurrency(1234.567);
  assert.match(result, /\$1,234\.57/);
});

test('formatCurrency should handle zero', () => {
  const result = formatCurrency(0);
  assert.match(result, /\$0/);
});

test('formatCurrency should handle negative numbers', () => {
  const result = formatCurrency(-500);
  // Some locales might put the minus sign in different places,
  // but we expect a standard representation.
  assert.match(result, /-\$500/);
});

test('formatCurrency should respect minimumFractionDigits: 0', () => {
  const result = formatCurrency(10);
  // It shouldn't show .00 if not necessary
  assert.match(result, /\$10/);
  assert.ok(!result.includes('.00'));
});
