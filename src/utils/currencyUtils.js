/**
 * Formatea un valor numérico como moneda USD.
 * @param {number} value - El valor a formatear.
 * @returns {string} El valor formateado.
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};
