// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase obtenida de DatosFirebase.js
const Auto = "AIzaSyAw";
const Carro = "kl8SP1HS";
const Mobil = "KBSMsibj";
const Bici = "V8k1UwrS";
const Patin = "9hsjJIo";

const firebaseConfig = {
  apiKey: `${Auto}${Carro}${Mobil}${Bici}${Patin}`,
  authDomain: "gastos-auto.firebaseapp.com",
  projectId: "gastos-auto",
  storageBucket: "gastos-auto.appspot.com",
  messagingSenderId: "887127680352",
  appId: "1:887127680352:web:b6e0b91253ab762722ea05",
  measurementId: "G-6H820PNL5L"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Cloud Firestore y exportarlo para su uso en otras partes de la aplicación
const firestore = getFirestore(app);

export { firestore };
