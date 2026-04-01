
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_KEY = 'nxpet_firebase_config';

export const getStoredConfig = (): FirebaseConfig | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.apiKey && parsed.projectId) return parsed;
    return null;
  } catch (e) {
    return null;
  }
};

export const saveConfig = (config: FirebaseConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const clearConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const config = getStoredConfig();

let auth: Auth | null = null;
let db: Firestore | null = null;

if (config) {
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
}

export { auth, db };
export const isFirebaseEnabled = () => !!(db && auth);
