// Este componente mostrará un selector (dropdown) para que el usuario
// pueda elegir qué vehículo desea gestionar.
// El valor seleccionado (la placa) se almacenará en un estado global (Context API)
// para que el resto de la aplicación sepa qué información mostrar.

import React, { useContext } from 'react';
import VehicleContext from '../context/VehicleContext';

const VehicleSwitcher = () => {
  const { vehicles, selectedVehicle, setSelectedVehicle } = useContext(VehicleContext);

  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label htmlFor="vehicle-select" style={{ fontWeight: 'bold' }}>Vehículo:</label>
      <select 
        id="vehicle-select" 
        value={selectedVehicle} 
        onChange={handleVehicleChange}
        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        {vehicles.map(plate => (
          <option key={plate} value={plate}>
            {plate}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VehicleSwitcher;

