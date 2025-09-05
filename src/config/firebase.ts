import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase設定（本番環境用）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAimaFngWw3k606oy9UWgSrKnXcfbvASDE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trip-management-app-47298.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trip-management-app-47298",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trip-management-app-47298.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "338823345553",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:338823345553:web:0ae79583cef43b1ff5d630"
};

// Firebase初期化
export const app = initializeApp(firebaseConfig);

// サービス初期化
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// 開発環境でのエミュレータ接続（一時的に無効化）
// if (import.meta.env.DEV && !(auth as any)._delegate?._config?.emulator) {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectStorageEmulator(storage, 'localhost', 9199);
//   } catch (error) {
//     console.log('Emulator connection skipped:', error);
//   }
// }