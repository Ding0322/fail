/**
 * Firebase Configuration & Offline Persistence Helper
 * Support for Firebase Modular SDK v9+
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore 
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration can be loaded from env or custom settings
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForOfflinePreviewMode12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "travel-techo-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "travel-techo-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "travel-techo-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Initialize Firebase App safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with local persistent caching
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);

/**
 * Anonymous sign-in helper
 */
export async function initAuth() {
  try {
    if (!auth.currentUser) {
      const userCred = await signInAnonymously(auth);
      return userCred.user;
    }
    return auth.currentUser;
  } catch (err) {
    console.warn("Firebase Auth Anonymous Login offline fallback:", err);
    return null;
  }
}

/**
 * Image compression utility (Reduces images to max 1200px and 0.8 JPEG quality)
 * Ensures ultra-fast upload to Firebase Storage and low localStorage memory footprint
 */
export async function compressImage(file: File | Blob, maxWidth = 1000, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Helper to upload photo to Firebase Storage or return base64 if offline/preview
 */
export async function uploadTravelPhoto(file: File, folder = 'travel_photos'): Promise<string> {
  try {
    const compressedBase64 = await compressImage(file);
    // If real Firebase projectId is configured (not dummy), try uploading to storage
    if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      const response = await fetch(compressedBase64);
      const blob = await response.blob();
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
      const uploadResult = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    }
    // Fallback: return compressed base64 for instant preview and offline storage
    return compressedBase64;
  } catch (error) {
    console.warn("Storage upload fallback to base64:", error);
    return await compressImage(file);
  }
}
