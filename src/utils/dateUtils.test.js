import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDate } from './dateUtils.js';

test('getLocalDate returns a string in YYYY-MM-DD format', () => {
  const result = getLocalDate();
  assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
});

test('getLocalDate correctly adjusts for timezone offset (Mocked UTC-5)', () => {
  const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
  // Mock timezone offset to 300 minutes (UTC-5)
  Date.prototype.getTimezoneOffset = () => 300;

  try {
    // Case 1: Noon Local Time
    // 12:00 PM Local = 17:00 UTC
    const d1 = new Date('2023-10-27T17:00:00Z');
    const result1 = getLocalDate(d1);
    assert.strictEqual(result1, '2023-10-27');

    // Case 2: Start of Day Local Time
    // 00:00 AM Local = 05:00 UTC
    const d2 = new Date('2023-10-27T05:00:00Z');
    const result2 = getLocalDate(d2);
    assert.strictEqual(result2, '2023-10-27');

    // Case 3: End of Day Local Time
    // 23:59 PM Local = 04:59 UTC Next Day
    const d3 = new Date('2023-10-28T04:59:00Z');
    const result3 = getLocalDate(d3);
    assert.strictEqual(result3, '2023-10-27');

  } finally {
    Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
  }
});

test('getLocalDate correctly adjusts for timezone offset (Mocked UTC+9)', () => {
  const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
  // Mock timezone offset to -540 minutes (UTC+9, e.g. Tokyo)
  Date.prototype.getTimezoneOffset = () => -540;

  try {
    // Case 1: Noon Local Time
    // 12:00 PM Local = 03:00 UTC
    const d1 = new Date('2023-10-27T03:00:00Z');
    const result1 = getLocalDate(d1);
    assert.strictEqual(result1, '2023-10-27');

    // Case 2: Start of Day Local Time
    // 00:00 AM Local = 15:00 UTC Previous Day
    const d2 = new Date('2023-10-26T15:00:00Z');
    const result2 = getLocalDate(d2);
    assert.strictEqual(result2, '2023-10-27');

  } finally {
    Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
  }
});

test('getLocalDate handles invalid inputs gracefully by returning current date', () => {
  const currentDateStr = getLocalDate();

  // Test with invalid string
  assert.strictEqual(getLocalDate('invalid-string'), currentDateStr, 'Should return current date for invalid string');

  // Test with number
  assert.strictEqual(getLocalDate(12345), currentDateStr, 'Should return current date for number input');

  // Test with invalid Date object
  assert.strictEqual(getLocalDate(new Date('invalid-date-string')), currentDateStr, 'Should return current date for invalid Date object');

  // Test with null
  assert.strictEqual(getLocalDate(null), currentDateStr, 'Should return current date for null input');
});
