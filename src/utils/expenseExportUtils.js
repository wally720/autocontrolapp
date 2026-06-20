import { CATEGORY_FUEL } from './constants.js';

export const EXPENSE_CSV_HEADERS = [
  'ID',
  'Vehículo',
  'Fecha',
  'Categoría',
  'Monto',
  'Notas',
  'Odómetro (kilometraje)',
  'Galones'
];

export const prepareExpenseCsvData = (expenses) => ({
  headers: EXPENSE_CSV_HEADERS,
  data: expenses.map(expense => [
    expense.id,
    expense.vehicleId,
    expense.date,
    expense.category,
    expense.amount,
    expense.notes,
    expense.odometer,
    expense.category === CATEGORY_FUEL ? expense.gallons : ''
  ])
});
