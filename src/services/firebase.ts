import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// User provided configuration
const config = {
    apiKey: "AIzaSyABIx6dty4gqKReJowV0Tnp3wCjQwqiOu0",
    authDomain: "morning-routine-dcb2a.firebaseapp.com",
    projectId: "morning-routine-dcb2a",
    storageBucket: "morning-routine-dcb2a.firebasestorage.app",
    messagingSenderId: "206609233952",
    appId: "1:206609233952:web:dadea5fcfdb772243da445",
    measurementId: "G-EQEHJNFL76",
    databaseURL: "https://morning-routine-dcb2a-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(config);

// Initialize Realtime Database and export it
export const db = getDatabase(app);
