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
