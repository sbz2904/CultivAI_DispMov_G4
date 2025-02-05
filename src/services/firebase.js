import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmCSFIu06-pTxnooSEaDeDihA0Nv9r9yE",
  authDomain: "nutriwiseg4.firebaseapp.com",
  projectId: "nutriwiseg4",
  storageBucket: "nutriwiseg4.firebasestorage.app",
  messagingSenderId: "786323826906",
  appId: "1:786323826906:web:f38751bfcede2943cb9de3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
