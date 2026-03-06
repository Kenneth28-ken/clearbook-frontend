
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAuMURKtwOabd9kLojctj26t0I3BK6xce8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clearbook-7b201.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clearbook-7b201",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clearbook-7b201.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "916165177766",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:916165177766:web:6e0070d31c5545ef14df67"
};

// Initialize Firebase using compat API
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();

// Use long polling for better connectivity in some environments
db.settings({
  // experimentalForceLongPolling: true
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
