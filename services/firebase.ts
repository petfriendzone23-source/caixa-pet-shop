import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuração do Firebase provisionada pelo AI Studio
const firebaseConfig = {
  projectId: "project-60432d0d-fba5-4ea8-aaf",
  appId: "1:289298340347:web:71adcfcb00c56d9135935e",
  apiKey: "AIzaSyACQ3qBpM-Krky6uYEhhzK5xRMFW0iaKYs",
  authDomain: "project-60432d0d-fba5-4ea8-aaf.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-132e87f8-04ab-4cb5-812b-672067a9cee5",
  storageBucket: "project-60432d0d-fba5-4ea8-aaf.firebasestorage.app",
  messagingSenderId: "289298340347",
  measurementId: ""
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { db, auth };
export const isFirebaseEnabled = () => !!firebaseConfig.apiKey && !!auth;
