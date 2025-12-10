import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_bU3s5d2wpsHApmPA_O3FwhiRfnQI5GI",
  authDomain: "unipool-910a3.firebaseapp.com",
  projectId: "unipool-910a3",
  storageBucket: "unipool-910a3.firebasestorage.app",
  messagingSenderId: "484920674284",
  appId: "1:484920674284:ios:f97a9ab8c9956fa907e2c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services 
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;