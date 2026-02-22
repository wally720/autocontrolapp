import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar App Check con reCAPTCHA Enterprise
// Nota: En desarrollo local, podrías necesitar activar el debug token en la consola de Firebase
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_FIREBASE_RECAPTCHA_KEY),
  isTokenAutoRefreshEnabled: true
});

// Inicializar Cloud Firestore y Auth
const firestore = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { firestore, auth, googleProvider, appCheck };
