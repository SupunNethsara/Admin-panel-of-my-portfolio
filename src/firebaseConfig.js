import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDr2D65v-Pmc_eyn3qs4RASqya6cNpfUs4",
  authDomain: "my-portfolio-c0afe.firebaseapp.com",
  projectId: "my-portfolio-c0afe",
  storageBucket: "my-portfolio-c0afe.appspot.com",
  messagingSenderId: "711951189543",
  appId: "1:711951189543:web:524b062dd4cbd2824e7002",
  measurementId: "G-3VY08Z5SXE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);