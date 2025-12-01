// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRr7r0VBJ_IotbtOaiIzzqG3Ori1jza3s",
  authDomain: "understanding-a8e65.firebaseapp.com",
  databaseURL: "https://understanding-a8e65-default-rtdb.firebaseio.com",
  projectId: "understanding-a8e65",
  storageBucket: "understanding-a8e65.firebasestorage.app",
  messagingSenderId: "693789314427",
  appId: "1:693789314427:web:5136c46015f42afea841de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;