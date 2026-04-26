// Import the functions you need from the SDKs you need
import {getAuth} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getEnv } from "./getEnv";
import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGrS92VM-WUYQOMn6TJg0ntDHxu_YWTzo",
  authDomain: "lekhak-2eb6a.firebaseapp.com",
  projectId: "lekhak-2eb6a",
  storageBucket: "lekhak-2eb6a.firebasestorage.app",
  messagingSenderId: "1083381150850",
  appId: "1:1083381150850:web:9564be2f9c0587aeac709b",
  measurementId: "G-CWCC9JSE02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();


export { auth, provider };