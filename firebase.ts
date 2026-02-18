
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
export { firebase };
