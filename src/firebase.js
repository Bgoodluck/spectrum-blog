// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "sonia-spectrum-blog.firebaseapp.com",
  projectId: "sonia-spectrum-blog",
  storageBucket: "sonia-spectrum-blog.firebasestorage.app",
  messagingSenderId: "448414992302",
  appId: "1:448414992302:web:684b3b7ba559da3f91ea3f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);