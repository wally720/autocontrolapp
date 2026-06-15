
import { performance } from 'perf_hooks';

// Generate test data
const generateExpenses = (count) => {
  const expenses = [];
  const startYear = 2023;

  for (let i = 0; i < count; i++) {
    const year = startYear + Math.floor(Math.random() * 2);
    const month = Math.floor(Math.random() * 12) + 1;
    const monthStr = String(month).padStart(2, '0');
    const day = Math.floor(Math.random() * 28) + 1;
    const dayStr = String(day).padStart(2, '0');

    expenses.push({
      date: `${year}-${monthStr}-${dayStr}`,
      amount: Math.random() * 100
    });
  }
  // Sort descending to match expected app behavior
  return expenses.sort((a, b) => b.date.localeCompare(a.date));
};

const EXPENSES_COUNT = 5000;
const ITERATIONS = 100;
const expenses = generateExpenses(EXPENSES_COUNT);

console.log(`Testing with ${EXPENSES_COUNT} expenses over ${ITERATIONS} iterations...`);

const runOriginal = () => {
  let totalTime = 0;
  let lastResult = null;

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    const data = expenses.reduce((acc, expense) => {
      const [year, monthNum] = expense.date.split('-').map(Number);
      const dateObj = new Date(year, monthNum - 1, 1);
      const month = dateObj.toLocaleString(undefined, { month: 'short', year: '2-digit' });
      const existingMonth = acc.find(item => item.month === month);

      if (existingMonth) {
        existingMonth.total += expense.amount;
      } else {
        acc.push({ month, total: expense.amount });
      }

      return acc;
    }, []).reverse();

    const end = performance.now();
    totalTime += (end - start);
    lastResult = data;
  }

  return { time: totalTime, result: lastResult };
};

const runOptimized = () => {
  let totalTime = 0;
  let lastResult = null;

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    // Use an object for O(1) lookups and cache the formatted month string
    const groups = {};
    const monthsOrder = [];

    // Cache for toLocaleString
    const labelCache = {};

    for (let j = 0; j < expenses.length; j++) {
      const expense = expenses[j];
      const monthKey = expense.date.substring(0, 7); // 'YYYY-MM'

      if (!groups[monthKey]) {
        if (!labelCache[monthKey]) {
          const [year, monthNum] = monthKey.split('-').map(Number);
          const dateObj = new Date(year, monthNum - 1, 1);
          labelCache[monthKey] = dateObj.toLocaleString(undefined, { month: 'short', year: '2-digit' });
        }
        groups[monthKey] = { month: labelCache[monthKey], total: 0 };
        monthsOrder.push(monthKey);
      }
      groups[monthKey].total += expense.amount;
    }

    const data = monthsOrder.map(key => groups[key]).reverse();

    const end = performance.now();
    totalTime += (end - start);
    lastResult = data;
  }

  return { time: totalTime, result: lastResult };
};

const orig = runOriginal();
const opt = runOptimized();

console.log("--- Results ---");
console.log(`Original Time: ${orig.time.toFixed(2)} ms`);
console.log(`Optimized Time: ${opt.time.toFixed(2)} ms`);
console.log(`Improvement: ${(orig.time / opt.time).toFixed(2)}x faster\n`);

// Basic verification
if (JSON.stringify(orig.result) === JSON.stringify(opt.result)) {
    console.log("Verification: SUCCESS - Results match exactly.");
} else {
    console.log("Verification: FAILURE - Results do not match!");
    // console.log("Original[0]:", orig.result[0]);
    // console.log("Optimized[0]:", opt.result[0]);
}
