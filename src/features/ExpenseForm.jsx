// src/features/ExpenseForm.jsx
import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { getLocalDate } from '../utils/dateUtils';
import { CATEGORY_FUEL, CATEGORY_LIST } from '../utils/constants';
import { FaPlus } from 'react-icons/fa';
import './ExpenseForm.css';

const ExpenseForm = () => {
  const { addExpense } = useExpenses();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORY_FUEL);

  const [date, setDate] = useState(getLocalDate());
  const [notes, setNotes] = useState('');
  const [odometer, setOdometer] = useState(''); // Estado para Kilometraje
  const [gallons, setGallons] = useState('');   // Estado para Galones

  const categories = CATEGORY_LIST;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !date) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (notes.length > 500) {
      alert('Las notas no pueden exceder los 500 caracteres.');
      return;
    }

    const newExpense = {
      amount: parseFloat(amount),
      category,
      date,
      notes: notes,
    };

    if (category === CATEGORY_FUEL) {
      if (!odometer || !gallons) {
        alert('Para gastos de combustible, por favor ingrese el kilometraje y los galones.');
        return;
      }
      newExpense.odometer = parseFloat(odometer);
      newExpense.gallons = parseFloat(gallons);
    }

    await addExpense(newExpense);

    // Limpiar el formulario
    setAmount('');
    setCategory(CATEGORY_FUEL);
    setDate(getLocalDate());
    setNotes('');
    setOdometer('');
    setGallons('');
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h3>Registrar Nuevo Gasto</h3>

      <div className="form-group">
        <label htmlFor="category">Categoría</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {category === CATEGORY_FUEL && (
        <div className="fuel-fields">
          <div className="form-group">
            <label htmlFor="odometer">Kilometraje (Odómetro)</label>
            <input
              id="odometer"
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="Ej: 85400"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gallons">Galones</label>
            <input
              id="gallons"
              type="number"
              step="0.01"
              value={gallons}
              onChange={(e) => setGallons(e.target.value)}
              placeholder="Ej: 10.5"
              required
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="amount">Monto Total Pagado</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ej: 95000"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Fecha</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notas (Opcional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Gasolina Extra en Esso"
          rows="3"
          maxLength={500}
        ></textarea>
        <div className="char-counter">
          {notes.length}/500
        </div>
      </div>
      <button type="submit" className="submit-button">
        <FaPlus style={{ marginRight: '8px' }} />
        Agregar Gasto
      </button>
    </form>
  );
};

export default ExpenseForm;

