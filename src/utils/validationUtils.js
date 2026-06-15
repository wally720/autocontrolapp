/**
 * Valida si una placa de vehículo es válida.
 * Solo se permiten caracteres alfanuméricos (letras de la A a la Z y números).
 *
 * @param {string} plate - La placa a validar.
 * @returns {boolean} - Verdadero si la placa es válida, falso de lo contrario.
 */
export const isValidPlate = (plate) => {
  const plateRegex = /^[A-Z0-9]+$/;
  return plateRegex.test(plate);
};

/**
 * Valida si una cadena de texto tiene el formato de fecha ISO local (AAAA-MM-DD).
 *
 * @param {string} dateStr - La cadena de fecha a validar.
 * @returns {boolean} - Verdadero si el formato es correcto, falso de lo contrario.
 */
export const isValidDateString = (dateStr) => {
  if (typeof dateStr !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(dateStr);
};
