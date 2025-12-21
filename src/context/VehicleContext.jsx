// src/context/VehicleContext.jsx
import React, { createContext, useState, useMemo } from 'react';

// 1. Crear el contexto
// Este es el objeto que los componentes usarán para acceder al estado.
const VehicleContext = createContext();

// Valores iniciales para las placas de los vehículos.
const initialVehicles = ['XXX000', 'LZW000'];

// 2. Crear el Proveedor (Provider)
// Este es un componente que envolverá a toda nuestra aplicación (o a las partes
// que necesiten acceso al estado del vehículo). Se encarga de gestionar el estado.
export const VehicleProvider = ({ children }) => {
  const [vehicles] = useState(initialVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicles[0]);

  // Usamos useMemo para evitar que el objeto de contexto se recree en cada render,
  // lo cual podría causar re-renders innecesarios en los componentes consumidores.
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

// 3. Exportar el contexto para que pueda ser usado por otros componentes.
export default VehicleContext;
