// src/features/VehicleSwitcher.jsx
import React, { useContext, useState } from 'react';
import VehicleContext from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../config/firebase';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { FaPlus } from 'react-icons/fa';

const VehicleSwitcher = () => {
  const { vehicles, selectedVehicle, setSelectedVehicle } = useContext(VehicleContext);
  const { currentUser } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newPlate, setNewPlate] = useState('');

  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  const handleAddPlate = async (e) => {
    e.preventDefault();
    const plate = newPlate.trim().toUpperCase();
    if (!plate) return;

    if (vehicles.length >= 2) {
      alert("Solo puedes tener un máximo de 2 placas.");
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
          alert("Este vehículo ya está registrado por otro usuario. Contacta al administrador para solicitar acceso compartido.");
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
    } catch (error) {
      console.error("Error al gestionar placa:", error);
      alert("Error al procesar la placa. Por favor, intenta de nuevo.");
    }
  };


  return (
    <div className="vehicle-switcher-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label htmlFor="vehicle-select" style={{ fontWeight: 'bold', color: 'white' }}>Vehículo:</label>
      <select
        id="vehicle-select"
        value={selectedVehicle}
        onChange={handleVehicleChange}
        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        {vehicles.length === 0 && <option value="">Sin vehículos</option>}
        {vehicles.map(plate => (
          <option key={plate} value={plate}>
            {plate}
          </option>
        ))}
      </select>

      {vehicles.length < 2 && (
        <div className="add-vehicle-section">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              style={{ padding: '8px', borderRadius: '4px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}
              title="Agregar nueva placa"
            >
              <FaPlus />
            </button>
          ) : (
            <form onSubmit={handleAddPlate} style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                placeholder="Placa"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                maxLength={10}
                style={{
                  padding: '8px',
                  width: '100px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  textTransform: 'uppercase'
                }}
                required
              />
              <button type="submit" style={{ padding: '8px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓</button>
              <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '8px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
            </form>

          )}
        </div>
      )}
    </div>
  );
};

export default VehicleSwitcher;
