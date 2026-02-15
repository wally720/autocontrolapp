/**
 * Sanitizes a value for CSV export to prevent CSV Injection and handle special characters.
 * @param {any} value - The value to sanitize.
 * @returns {string} The sanitized and quoted CSV field.
 */
export const sanitizeForCSV = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }

  let stringValue = String(value);

  // Prevent CSV Injection (Formula Injection)
  // Prefix with single quote if it starts with =, +, -, or @
  if (/^[=+\-@]/.test(stringValue)) {
    stringValue = "'" + stringValue;
  }

  // Escape double quotes by doubling them
  // Wrap the entire field in double quotes
  return `"${stringValue.replace(/"/g, '""')}"`;
};
