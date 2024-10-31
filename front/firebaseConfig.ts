import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCuiyGwiaIcq4rGkGyTQDgBDq1MWAPpCIw",
    authDomain: "listatarefas-86915.firebaseapp.com",
    projectId: "listatarefas-86915",
    storageBucket: "listatarefas-86915.appspot.com",
    messagingSenderId: "919424635395",
    appId: "1:919424635395:web:3de30c2dda18c270e4b436",
    measurementId: "G-97Y8NCF3C4"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize o Firestore
const db = getFirestore(app);

export { db };
