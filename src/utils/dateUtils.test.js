import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDate, parseLocalDate } from './dateUtils.js';

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

test('parseLocalDate returns correct Date object for valid string', () => {
  const dateStr = '2023-10-27';
  const result = parseLocalDate(dateStr);

  assert.strictEqual(result.getFullYear(), 2023);
  assert.strictEqual(result.getMonth(), 9); // Oct is 9
  assert.strictEqual(result.getDate(), 27);
  assert.strictEqual(result.getHours(), 0);
  assert.strictEqual(result.getMinutes(), 0);
  assert.strictEqual(result.getSeconds(), 0);
  assert.strictEqual(result.getMilliseconds(), 0);
});

test('parseLocalDate returns null for empty string or null', () => {
  assert.strictEqual(parseLocalDate(''), null);
  assert.strictEqual(parseLocalDate(null), null);
  assert.strictEqual(parseLocalDate(undefined), null);
});
