
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAuMURKtwOabd9kLojctj26t0I3BK6xce8",
  authDomain: "clearbook-7b201.firebaseapp.com",
  projectId: "clearbook-7b201",
  storageBucket: "clearbook-7b201.firebasestorage.app",
  messagingSenderId: "916165177766",
  appId: "1:916165177766:web:6e0070d31c5545ef14df67"
};

// Initialize Firebase using compat API
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
    console.warn('Firestore persistence failed: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn('Firestore persistence failed: browser not supported');
  }
});

export { firebase };
