import { CATEGORY_FUEL } from './constants.js';

export const FUEL_TYPE_NORMAL = 'normal';
export const FUEL_TYPE_PREMIUM = 'premium';
export const FUEL_TYPE_DIESEL = 'diesel';
export const FUEL_TYPE_OTHER = 'other';

export const DEFAULT_FUEL_TYPE = FUEL_TYPE_NORMAL;

export const FUEL_TYPE_OPTIONS = [
  {
    value: FUEL_TYPE_NORMAL,
    label: 'Normal',
    abbreviation: 'NORM',
    tooltip: 'Corriente',
    className: 'fuel-type-normal',
  },
  {
    value: FUEL_TYPE_PREMIUM,
    label: 'Premium',
    abbreviation: 'PREM',
    tooltip: 'Extra',
    className: 'fuel-type-premium',
  },
  {
    value: FUEL_TYPE_DIESEL,
    label: 'Diesel',
    abbreviation: 'DSL',
    tooltip: 'Diesel',
    className: 'fuel-type-diesel',
  },
  {
    value: FUEL_TYPE_OTHER,
    label: 'Otro',
    abbreviation: 'OTRO',
    tooltip: 'Otro',
    className: 'fuel-type-other',
  },
];

const FUEL_TYPE_BY_VALUE = new Map(FUEL_TYPE_OPTIONS.map(option => [option.value, option]));

export const normalizeFuelType = (fuelType) => {
  return FUEL_TYPE_BY_VALUE.has(fuelType) ? fuelType : DEFAULT_FUEL_TYPE;
};

export const getFuelTypeOption = (fuelType) => {
  return FUEL_TYPE_BY_VALUE.get(normalizeFuelType(fuelType));
};

export const getExpenseFuelTypeDisplay = (expense) => {
  if (expense?.category !== CATEGORY_FUEL) return null;

  const option = getFuelTypeOption(expense?.fuelType);

  return {
    ...option,
    className: `fuel-type-tag ${option.className}`,
  };
};
