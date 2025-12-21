// src/hooks/useExpenses.js
import { useState, useEffect, useContext } from 'react';
import { firestore } from '../config/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import VehicleContext from '../context/VehicleContext';

/**
 * Hook personalizado para gestionar los gastos de un vehículo específico.
 * Proporciona los gastos en tiempo real y funciones para agregar o eliminar gastos.
 * @returns {object} - { expenses, loading, addExpense, deleteExpense }
 */
export const useExpenses = () => {
  const { selectedVehicle } = useContext(VehicleContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVehicle) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
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
      console.error("Error al obtener los gastos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedVehicle]);

  /**
   * Agrega un nuevo documento de gasto a la colección 'expenses'.
   * @param {object} expense - El objeto de gasto a agregar.
   */
  const addExpense = async (expense) => {
    if (!selectedVehicle) {
      console.error("No se puede agregar el gasto: no hay un vehículo seleccionado.");
      return;
    }
    try {
      await addDoc(collection(firestore, "expenses"), { 
        ...expense, 
        vehicleId: selectedVehicle 
      });
    } catch (error) {
      console.error("Error al agregar el gasto:", error);
    }
  };

  /**
   * Elimina un documento de gasto de la colección 'expenses'.
   * @param {string} id - El ID del documento a eliminar.
   */
  const deleteExpense = async (id) => {
    try {
      const expenseDoc = doc(firestore, "expenses", id);
      await deleteDoc(expenseDoc);
    } catch (error) {
      console.error("Error al eliminar el gasto:", error);
    }
  };

  return { expenses, loading, addExpense, deleteExpense };
};
