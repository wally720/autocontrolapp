import { performance } from 'perf_hooks';

// Simulate parseLocalDate behavior roughly
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

// Generate test data
const generateExpenses = (count) => {
  const expenses = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11

  for (let i = 0; i < count; i++) {
    // Random month between 0 and 11
    const randomMonth = Math.floor(Math.random() * 12);
    // Pad month to 2 digits for string format (1-12)
    const monthStr = String(randomMonth + 1).padStart(2, '0');
    // Random day
    const dayStr = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

    expenses.push({
      date: `${currentYear}-${monthStr}-${dayStr}`,
      amount: Math.random() * 100
    });
  }
  return expenses;
};

const EXPENSES_COUNT = 10000;
const ITERATIONS = 100; // Simulate 100 component renders
const expenses = generateExpenses(EXPENSES_COUNT);

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();
const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

console.log(`Testing with ${EXPENSES_COUNT} expenses over ${ITERATIONS} renders...`);

// Original Approach (Current Code)
// Re-calculates on every render
const runOriginal = () => {
  let totalTime = 0;
  let lastResult = null;

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    let currentMonthTotal = 0;
    let previousMonthTotal = 0;

    expenses.forEach(expense => {
      const [year, month] = expense.date.split('-').map(Number);
      const expenseMonth = month - 1;
      const expenseYear = year;

      if (expenseYear === currentYear && expenseMonth === currentMonth) {
        currentMonthTotal += expense.amount;
      }
      if (expenseYear === previousMonthYear && expenseMonth === previousMonth) {
        previousMonthTotal += expense.amount;
      }
    });

    let percentageChange = 0;
    if (previousMonthTotal > 0) {
      percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      percentageChange = 100;
    }

    const end = performance.now();
    totalTime += (end - start);
    lastResult = { currentMonthTotal, previousMonthTotal, percentageChange };
  }

  return { time: totalTime, result: lastResult };
};

// Optimized Approach
// Calculates ONLY ONCE (simulating useMemo) and uses string prefix matching
const runOptimized = () => {
  let totalTime = 0;
  let lastResult = null;

  // 1. We pre-compute the matching string prefixes ONE TIME
  const currentMonthStr = String(currentMonth + 1).padStart(2, '0');
  const previousMonthStr = String(previousMonth + 1).padStart(2, '0');

  const currentPrefix = `${currentYear}-${currentMonthStr}-`;
  const previousPrefix = `${previousMonthYear}-${previousMonthStr}-`;

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    // Simulate useMemo - we only run the loop ONCE if expenses haven't changed.
    // In a real render loop, if expenses didn't change, time taken would be ~0ms.
    // For the benchmark, we simulate what happens if the component re-renders
    // but the `useMemo` cache is hit.
    if (i === 0) {
      // THIS IS THE ONLY TIME WE DO THE WORK
      let currentMonthTotal = 0;
      let previousMonthTotal = 0;

      // Notice we avoid string splitting entirely by using startsWith
      for (let j = 0; j < expenses.length; j++) {
         const exp = expenses[j];
         if (exp.date.startsWith(currentPrefix)) {
            currentMonthTotal += exp.amount;
         } else if (exp.date.startsWith(previousPrefix)) {
            previousMonthTotal += exp.amount;
         }
      }

      let percentageChange = 0;
      if (previousMonthTotal > 0) {
        percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      } else if (currentMonthTotal > 0) {
        percentageChange = 100;
      }

      lastResult = { currentMonthTotal, previousMonthTotal, percentageChange };
    }
    // Else (i > 0): we would just return lastResult instantly (cache hit)

    const end = performance.now();
    totalTime += (end - start);
  }

  return { time: totalTime, result: lastResult };
};

// Also let's measure just the parsing speedup (using startsWith vs split/map)
const runParsingOnly = () => {
  let totalTime = 0;
  const currentMonthStr = String(currentMonth + 1).padStart(2, '0');
  const previousMonthStr = String(previousMonth + 1).padStart(2, '0');
  const currentPrefix = `${currentYear}-${currentMonthStr}-`;
  const previousPrefix = `${previousMonthYear}-${previousMonthStr}-`;

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    let currentMonthTotal = 0;
    let previousMonthTotal = 0;

    for (let j = 0; j < expenses.length; j++) {
       const exp = expenses[j];
       if (exp.date.startsWith(currentPrefix)) {
          currentMonthTotal += exp.amount;
       } else if (exp.date.startsWith(previousPrefix)) {
          previousMonthTotal += exp.amount;
       }
    }
    const end = performance.now();
    totalTime += (end - start);
  }
  return { time: totalTime };
}


const orig = runOriginal();
const opt = runOptimized();
const parsingOpt = runParsingOnly();

console.log("--- Results ---");
console.log(`Original Time (100 renders): ${orig.time.toFixed(2)} ms`);
console.log(`Optimized Time (100 renders w/ useMemo): ${opt.time.toFixed(2)} ms`);
console.log(`Improvement: ${(orig.time / opt.time).toFixed(2)}x faster\n`);

console.log(`(Extra) Loop Efficiency (without memoization):`);
console.log(`Original Loop (100x): ${orig.time.toFixed(2)} ms`);
console.log(`Optimized Loop via startsWith (100x): ${parsingOpt.time.toFixed(2)} ms`);
console.log(`Loop Speedup: ${(orig.time / parsingOpt.time).toFixed(2)}x faster\n`);

console.log("Sanity Check (Values should match):");
console.log("Orig Result:", orig.result);
console.log("Opt Result:", opt.result);
