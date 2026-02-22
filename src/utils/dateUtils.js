/**
 * Returns the current date (or the date passed) in local YYYY-MM-DD format.
 * This accounts for the timezone offset.
 * @param {Date} [d=new Date()] - The date to format.
 * @returns {string} The formatted date string.
 */
export const getLocalDate = (d = new Date()) => {
  let dateToUse = d;
  if (!(dateToUse instanceof Date) || isNaN(dateToUse.getTime())) {
    dateToUse = new Date();
  }

  const offset = dateToUse.getTimezoneOffset();
  const localDate = new Date(dateToUse.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

/**
 * Parses a "YYYY-MM-DD" string into a local Date object.
 * @param {string} dateStr - The date string to parse.
 * @returns {Date|null} The local Date object or null if dateStr is invalid.
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  // Note: Month is 0-indexed in Date constructor (0=Jan, 11=Dec)
  return new Date(y, m - 1, d);
};
