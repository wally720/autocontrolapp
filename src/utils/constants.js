// src/utils/constants.js

// Definiciones de categorías de gastos
export const CATEGORY_FUEL = 'Combustible';
export const CATEGORY_MAINTENANCE = 'Mantenimiento';
export const CATEGORY_INSURANCE = 'Seguros/Papeles';
export const CATEGORY_TAXES = 'Impuestos';
export const CATEGORY_WASH = 'Lavado';
export const CATEGORY_PARKING = 'Parqueadero';
export const CATEGORY_TOLLS = 'Peajes';
export const CATEGORY_TIRES = 'Llantas';
export const CATEGORY_OTHER = 'Otros';

// Objeto de categorías para fácil acceso
export const CATEGORIES = {
  FUEL: CATEGORY_FUEL,
  MAINTENANCE: CATEGORY_MAINTENANCE,
  INSURANCE: CATEGORY_INSURANCE,
  TAXES: CATEGORY_TAXES,
  WASH: CATEGORY_WASH,
  PARKING: CATEGORY_PARKING,
  TOLLS: CATEGORY_TOLLS,
  TIRES: CATEGORY_TIRES,
  OTHER: CATEGORY_OTHER,
};

// Lista ordenada de categorías para selectores y validación
export const CATEGORY_LIST = [
  CATEGORY_FUEL,
  CATEGORY_MAINTENANCE,
  CATEGORY_INSURANCE,
  CATEGORY_TAXES,
  CATEGORY_WASH,
  CATEGORY_PARKING,
  CATEGORY_TOLLS,
  CATEGORY_TIRES,
  CATEGORY_OTHER,
];

// Constantes de límites de la aplicación
export const MAX_VEHICLES_PER_USER = 2;
export const MAX_VEHICLES_ERROR_MSG = "Solo puedes tener un máximo de 2 placas.";
