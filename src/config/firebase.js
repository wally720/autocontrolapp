// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


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

import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar App Check con reCAPTCHA Enterprise
// Nota: En desarrollo local, podrías necesitar activar el debug token en la consola de Firebase
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('6Lfoj0IsAAAAAFcycYMz3_3Ur-73vqTmHJLMXg3x'),
  isTokenAutoRefreshEnabled: true
});

// Inicializar Cloud Firestore y Auth
const firestore = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { firestore, auth, googleProvider, appCheck };



