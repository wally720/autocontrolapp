// src/hooks/useExpenses.js
import { useState, useEffect, useContext } from 'react';
import { firestore } from '../config/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import VehicleContext from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

/**
 * Hook personalizado para gestionar los gastos de un vehículo específico.
 */
export const useExpenses = () => {
  const { selectedVehicle } = useContext(VehicleContext);
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVehicle || !currentUser) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Ahora filtramos SOLO por vehicleId para permitir acceso compartido.
    // La seguridad se delega a las Reglas de Firestore (verificando authorizedUsers).
    const q = query(
      collection(firestore, "expenses"),
      where("vehicleId", "==", selectedVehicle),
      orderBy("date", "desc")
    );


    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData = [];
      querySnapshot.forEach((doc) => {
        expensesData.push({ ...doc.data(), id: doc.id });
      });
      setExpenses(expensesData);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener los gastos:", error?.code || 'unknown');
      showNotification('No se pudieron cargar los gastos del vehículo seleccionado.', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedVehicle, currentUser, showNotification]);

  const addExpense = async (expense) => {
    if (!selectedVehicle || !currentUser) {
      console.error("No se puede agregar el gasto: falta vehículo o usuario.");
      showNotification('No se puede agregar el gasto sin un vehículo y un usuario activos.', 'error');
      return false;
    }
    try {
      await addDoc(collection(firestore, "expenses"), {
        ...expense,
        vehicleId: selectedVehicle,
        userId: currentUser.uid // Guardar ID del usuario
      });
      return true;
    } catch (error) {
      console.error("Error al agregar el gasto:", error?.code || 'unknown');
      showNotification('No se pudo agregar el gasto. Intentá de nuevo.', 'error');
      return false;
    }
  };

  const deleteExpense = async (id) => {
    try {
      const expenseDoc = doc(firestore, "expenses", id);
      await deleteDoc(expenseDoc);
      return true;
    } catch (error) {
      console.error("Error al eliminar el gasto:", error?.code || 'unknown');
      showNotification('No se pudo eliminar el gasto. Intentá de nuevo.', 'error');
      return false;
    }
  };

  return { expenses, loading, addExpense, deleteExpense };
};

