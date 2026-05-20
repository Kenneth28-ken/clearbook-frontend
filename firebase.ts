
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

// Initialize Firebase using compat API
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();

// Use long polling for better connectivity in some environments
db.settings({
  experimentalForceLongPolling: true
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
