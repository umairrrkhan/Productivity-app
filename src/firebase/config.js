import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "ur api key",
  authDomain: "ur domain ",
  projectId: "ur id ",
  storageBucket: "ur storage bucket",
  messagingSenderId: "ur sender id ",
  appId: "ur app id  ",
  measurementId: "ur measurement id ",
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };