
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Log warning if config is missing (but don't expose secrets)
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.warn("⚠️ Firebase configuration keys are missing in the environment:", missingKeys.join(", "));
}

// Initialize Firebase using compat API
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();

// Enable auto-detect long polling and ignore undefined properties for robust offline/online resilience
db.settings({
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true
});

// Enable offline persistence
// db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
//   if (err.code === 'failed-precondition') {
//     // Multiple tabs open, persistence can only be enabled in one tab at a a time.
//     console.warn('Firestore persistence failed: multiple tabs open');
//   } else if (err.code === 'unimplemented') {
//     // The current browser does not support all of the features required to enable persistence
//     console.warn('Firestore persistence failed: browser not supported');
//   }
// });

export { firebase };
