import { CATEGORY_FUEL } from '../../utils/constants.js';

/**
 * Calculates fuel efficiency based on a list of expenses.
 * @param {Array} expenses - List of expense objects.
 * @returns {Object} - Object containing periods and averages.
 */
export const calculateEfficiency = (expenses) => {
  const fuelStops = expenses
    .filter(e => e.category === CATEGORY_FUEL && e.odometer && e.gallons > 0)
    .sort((a, b) => a.odometer - b.odometer);

  if (fuelStops.length < 2) return { periods: [], averages: {} };

  const periods = [];
  let totalKm = 0;
  let totalGallons = 0;
  let totalCost = 0;

  for (let i = 1; i < fuelStops.length; i++) {
    const prevStop = fuelStops[i - 1];
    const currentStop = fuelStops[i];

    const kmTraveled = currentStop.odometer - prevStop.odometer;
    const gallonsUsed = currentStop.gallons; // Efficiency is calculated on the fill-up
    const cost = currentStop.amount;

    if (kmTraveled > 0) {
      totalKm += kmTraveled;
      totalGallons += gallonsUsed;
      totalCost += cost;

      periods.push({
        id: currentStop.id,
        period: `${prevStop.date.slice(5)} -> ${currentStop.date.slice(5)}`,
        kmTraveled,
        gallonsUsed,
        efficiency: kmTraveled / gallonsUsed,
        costPerKm: cost / kmTraveled,
      });
    }
  }

  const averages = {
    avgEfficiency: totalGallons > 0 ? totalKm / totalGallons : 0,
    avgCostPerKm: totalKm > 0 ? totalCost / totalKm : 0,
  };

  return { periods: periods.reverse(), averages };
};
