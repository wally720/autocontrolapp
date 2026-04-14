// src/features/VehicleSwitcher.jsx
import React, { useContext, useState } from 'react';
import './VehicleSwitcher.css';
import VehicleContext from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../config/firebase';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { FaPlus } from 'react-icons/fa';
import { isValidPlate } from '../utils/validationUtils';
import { MAX_VEHICLES_PER_USER, MAX_VEHICLES_ERROR_MSG } from '../utils/constants';
import { useNotification } from '../context/NotificationContext';

const VehicleSwitcher = () => {
  const { vehicles, selectedVehicle, setSelectedVehicle } = useContext(VehicleContext);
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [isAdding, setIsAdding] = useState(false);
  const [newPlate, setNewPlate] = useState('');

  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  const handleAddPlate = async (e) => {
    e.preventDefault();
    const plate = newPlate.trim().toUpperCase();
    if (!plate) return;

    if (!isValidPlate(plate)) {
      showNotification('La placa ingresada no es válida. Solo se permiten letras y números.', 'error');
      return;
    }

    if (vehicles.length >= MAX_VEHICLES_PER_USER) {
      showNotification(MAX_VEHICLES_ERROR_MSG, 'error');
      return;
    }

    try {
      // 1. Verificar si la placa ya existe en el registro central
      const vehicleRef = doc(firestore, 'vehicles', plate);
      const vehicleDoc = await getDoc(vehicleRef);

      if (vehicleDoc.exists()) {
        const data = vehicleDoc.data();
        // Si ya existe pero el usuario NO está en la lista de autorizados
        if (!data.authorizedUsers.includes(currentUser.uid)) {
          showNotification('Este vehículo ya está registrado por otro usuario. Contactá al administrador para solicitar acceso compartido.', 'error');
          return;
        }
        // Si existe y ya estaba autorizado, solo sigue adelante
      } else {
        // 2. Si NO existe, crear el registro central de la placa
        await setDoc(vehicleRef, {
          plate: plate,
          ownerId: currentUser.uid,
          authorizedUsers: [currentUser.uid],
          createdAt: new Date().toISOString()
        });
      }

      // 3. Agregar la placa al perfil personal del usuario para navegación
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        vehicles: arrayUnion(plate)
      });

      setNewPlate('');
      setIsAdding(false);
      showNotification(`Vehículo ${plate} agregado correctamente.`, 'success');
    } catch (error) {
      console.error("Error al gestionar placa:", error);
      showNotification('Error al procesar la placa. Por favor, intentá de nuevo.', 'error');
    }
  };


  return (
    <div className="vehicle-switcher-container">
      <label htmlFor="vehicle-select" className="vehicle-switcher-label">Vehículo:</label>
      <select
        id="vehicle-select"
        value={selectedVehicle}
        onChange={handleVehicleChange}
        className="vehicle-select"
      >
        {vehicles.length === 0 && <option value="">Sin vehículos</option>}
        {vehicles.map(plate => (
          <option key={plate} value={plate}>
            {plate}
          </option>
        ))}
      </select>

      {vehicles.length < MAX_VEHICLES_PER_USER && (
        <div className="add-vehicle-section">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="add-vehicle-button"
              title="Agregar nueva placa"
            >
              <FaPlus />
            </button>
          ) : (
            <form onSubmit={handleAddPlate} className="add-vehicle-form">
              <input
                type="text"
                placeholder="Placa"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                maxLength={10}
                className="add-vehicle-input"
                required
              />
              <button type="submit" className="submit-vehicle-button">✓</button>
              <button type="button" onClick={() => setIsAdding(false)} className="cancel-vehicle-button">✕</button>
            </form>

          )}
        </div>
      )}
    </div>
  );
};

export default VehicleSwitcher;
