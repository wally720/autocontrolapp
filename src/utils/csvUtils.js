/**
 * Sanitiza un valor para la exportación CSV para prevenir inyección de CSV y manejar caracteres especiales.
 * @param {any} value - El valor a sanitizar.
 * @returns {string} El campo CSV sanitizado y entrecomillado.
 */
export const sanitizeForCSV = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }

  let stringValue = String(value);

  // Prevenir inyección de CSV (Inyección de Fórmulas)
  // Prefijar con comilla simple si comienza con =, +, -, o @ (incluso precedido por espacios)
  if (/^\s*[=+\-@]/.test(stringValue)) {
    stringValue = "'" + stringValue;
  }

  // Escapar comillas dobles duplicándolas
  // Envolver todo el campo en comillas dobles
  return `"${stringValue.replace(/"/g, '""')}"`;
};

/**
 * Genera una cadena CSV a partir de encabezados y filas de datos, asegurando la codificación correcta.
 * @param {string[]} headers - Array de cadenas de encabezado.
 * @param {Array<Array<any>>} data - Array de arrays que contienen los datos de las filas.
 * @returns {string} El contenido CSV generado con BOM.
 */
export const generateCSV = (headers, data) => {
  const csvRows = [];

  // Agregar encabezados sanitizados
  const sanitizedHeaders = headers.map(header => sanitizeForCSV(header));
  csvRows.push(sanitizedHeaders.join(','));

  // Agregar filas de datos
  data.forEach(row => {
    const sanitizedRow = row.map(value => sanitizeForCSV(value));
    csvRows.push(sanitizedRow.join(','));
  });

  // Agregar BOM para compatibilidad con UTF-8
  return '\ufeff' + csvRows.join('\n');
};

/**
 * Activa una descarga en el navegador para el contenido CSV dado.
 * @param {string} csvContent - El contenido de la cadena CSV.
 * @param {string} fileName - El nombre para el archivo descargado.
 */
export const downloadCSV = (csvContent, fileName) => {
  // Crear Blob con charset UTF-8 explícito
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Crear enlace de descarga
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);

    // Activar descarga
    link.click();

    // Limpieza
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
