// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDb-hM7Ttcb98HARvXoElwGxlx0HY1gbrU",
  authDomain: "login-page-e3646.firebaseapp.com",
  projectId: "login-page-e3646",
  storageBucket: "login-page-e3646.firebasestorage.app",
  messagingSenderId: "65267149748",
  appId: "1:65267149748:web:b2550b5d7f660ce26ae0e1",
  databaseURL: "https://login-page-e3646-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
