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
