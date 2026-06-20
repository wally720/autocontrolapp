import { CATEGORY_FUEL } from './constants.js';

const hasDisplayValue = (value) => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

const formatNumericDisplayValue = (value, options) => {
  if (!hasDisplayValue(value)) return null;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;

  return new Intl.NumberFormat(undefined, options).format(numericValue);
};

export const formatOdometerDisplay = (odometer) => {
  const formattedOdometer = formatNumericDisplayValue(odometer, {
    maximumFractionDigits: 0,
  });

  return formattedOdometer ? `${formattedOdometer} km` : null;
};

export const formatGallonsDisplay = (gallons) => {
  const formattedGallons = formatNumericDisplayValue(gallons, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formattedGallons ? `${formattedGallons} Gal` : null;
};

export const getExpenseVehicleDetailDisplays = (expense) => {
  const odometer = formatOdometerDisplay(expense?.odometer);
  const gallons = expense?.category === CATEGORY_FUEL
    ? formatGallonsDisplay(expense?.gallons)
    : null;

  return [odometer, gallons].filter(Boolean);
};
