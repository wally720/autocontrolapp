// src/features/ExpenseForm.jsx
import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useNotification } from '../context/NotificationContext';
import { getLocalDate } from '../utils/dateUtils';
import { CATEGORY_FUEL, CATEGORY_LIST } from '../utils/constants';
import { FaPlus, FaGasPump, FaWrench, FaCarSide } from 'react-icons/fa';
import './ExpenseForm.css';

const ExpenseForm = () => {
  const { addExpense } = useExpenses();
  const { showNotification } = useNotification();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORY_FUEL);
  const [date, setDate] = useState(getLocalDate());
  const [notes, setNotes] = useState('');
  const [odometer, setOdometer] = useState('');
  const [gallons, setGallons] = useState('');

  const categories = CATEGORY_LIST;
  const isFuel = category === CATEGORY_FUEL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !date) {
      showNotification('Por favor completá todos los campos obligatorios.', 'error');
      return;
    }

    if (notes.length > 500) {
      showNotification('Las notas no pueden exceder los 500 caracteres.', 'error');
      return;
    }

    const newExpense = {
      amount: parseFloat(amount),
      category,
      date,
      notes: notes,
    };

    if (isFuel) {
      if (!odometer || !gallons) {
        showNotification('Para gastos de combustible tenés que ingresar kilometraje y galones.', 'error');
        return;
      }
      newExpense.odometer = parseFloat(odometer);
      newExpense.gallons = parseFloat(gallons);
    } else if (odometer) {
      newExpense.odometer = parseFloat(odometer);
    }

    const created = await addExpense(newExpense);

    if (!created) {
      return;
    }

    showNotification('Gasto agregado correctamente.', 'success');

    setAmount('');
    setCategory(CATEGORY_FUEL);
    setDate(getLocalDate());
    setNotes('');
    setOdometer('');
    setGallons('');
  };

  const getCategoryIcon = () => {
    switch (category) {
      case CATEGORY_FUEL:
        return <FaGasPump />;
      case 'Mantenimiento':
        return <FaWrench />;
      default:
        return <FaCarSide />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="expense-form-heading">
        <span className="expense-form-kicker">Nueva transacción</span>
        <h3>Registrar Nuevo Gasto</h3>
      </div>

      {/* Categoría - всегда primeira */}
      <div className="form-section form-section-primary">
        <div className="form-group">
          <label htmlFor="category">
            <span className="label-icon">{getCategoryIcon()}</span> Categoría
          </label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Monto e Fecha - siempre visibles */}
      <div className="form-section form-section-grid">
        <div className="form-group">
          <label htmlFor="amount">💰 Monto</label>
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
          <label htmlFor="date">📅 Fecha</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Notas - área completa */}
      <div className="form-section form-group">
        <label htmlFor="notes">📝 Notas (Opcional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Cambio de aceite en Auto servicio X"
          rows="3"
          maxLength={500}
        ></textarea>
        <div className="char-counter">
          {notes.length}/500
        </div>
      </div>

      {/* Datos específicos por categoría */}
      {isFuel ? (
        <div className="form-section fuel-fields" aria-label="Datos de combustible">
          <div className="form-group">
            <label htmlFor="gallons">⛽ Galones</label>
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
          <div className="form-group">
            <label htmlFor="odometer">🛣️ Kilometraje</label>
            <input
              id="odometer"
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="Ej: 85400"
              required
            />
          </div>
        </div>
      ) : (
        <div className="form-section odometer-optional" aria-label="Kilometraje opcional">
          <div className="form-group">
            <label htmlFor="odometer">🛣️ Kilometraje (Opcional)</label>
            <input
              id="odometer"
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="Ej: 33234"
            />
          </div>
        </div>
      )}

      <button type="submit" className="submit-button">
        <FaPlus className="submit-button-icon" aria-hidden="true" />
        Agregar Gasto
      </button>
    </form>
  );
};

export default ExpenseForm;