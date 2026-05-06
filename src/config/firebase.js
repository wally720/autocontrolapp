import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

const appCheckDebugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;

if (import.meta.env.DEV && appCheckDebugToken) {
  globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken === 'true'
    ? true
    : appCheckDebugToken;
}

// Inicializar App Check con reCAPTCHA Enterprise
// En desarrollo local, VITE_FIREBASE_APPCHECK_DEBUG_TOKEN permite usar un token de depuración registrado en Firebase.
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_FIREBASE_RECAPTCHA_KEY),
  isTokenAutoRefreshEnabled: true
});

// Inicializar Cloud Firestore y Auth
const firestore = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { firestore, auth, googleProvider, appCheck };
