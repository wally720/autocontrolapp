// src/context/VehicleContext.jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState('');

  // Sincronizar vehicles desde el perfil del usuario
  const vehicles = useMemo(() => userProfile?.vehicles || [], [userProfile]);

  // Si no hay vehículo seleccionado o el seleccionado ya no existe, elegir el primero
  useEffect(() => {
    if (vehicles.length > 0) {
      if (!selectedVehicle || !vehicles.includes(selectedVehicle)) {
        setSelectedVehicle(vehicles[0]);
      }
    } else {
      setSelectedVehicle('');
    }
  }, [vehicles, selectedVehicle]);

  const value = useMemo(() => ({
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
  }), [vehicles, selectedVehicle]);

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleContext;

